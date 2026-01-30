#!/usr/bin/env bash

##############################################################################
# Mindweal Testing Database Setup Script
##############################################################################
# This script automates the setup of a complete testing database
#
# Usage: bash ./setup-testing-env.sh
#
# Environment variables (optional):
#   DB_HOST       - Database host (default: localhost)
#   DB_PORT       - Database port (default: 3306)
#   DB_USER       - Database user (default: mindweal)
#   DB_PASSWORD   - Database password (will prompt if not set)
#   DB_NAME       - Database name (default: mindweal)
#   USE_DOCKER    - Set to "1" to use docker exec instead of mysql client
#   CONTAINER     - Docker container name (default: mindweal-mysql)
##############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration with defaults
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-3306}"
DB_USER="${DB_USER:-mindweal}"
DB_NAME="${DB_NAME:-mindweal}"
USE_DOCKER="${USE_DOCKER:-0}"
CONTAINER="${CONTAINER:-mindweal-mysql}"

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SQL_FILE="$SCRIPT_DIR/setup-testing-database.sql"

# Functions
print_header() {
    echo ""
    echo -e "${BLUE}==============================================================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}==============================================================================${NC}"
    echo ""
}

print_success() {
    echo -e "${GREEN}[OK]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

# Execute MySQL command - uses docker or native client
mysql_exec() {
    if [ "$USE_DOCKER" = "1" ]; then
        docker exec -i "$CONTAINER" mysql -u "$DB_USER" -p"$DB_PASSWORD" "$@"
    else
        mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" "$@"
    fi
}

# Execute MySQL command with database
mysql_exec_db() {
    if [ "$USE_DOCKER" = "1" ]; then
        docker exec -i "$CONTAINER" mysql -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" "$@"
    else
        mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" "$@"
    fi
}

check_prerequisites() {
    if [ "$USE_DOCKER" = "1" ]; then
        if ! command -v docker &> /dev/null; then
            print_error "Docker not found. Please install Docker."
            exit 1
        fi
        if ! docker ps --format '{{.Names}}' | grep -q "^${CONTAINER}$"; then
            print_error "Docker container '$CONTAINER' not running."
            print_info "Start it with: docker-compose up -d"
            exit 1
        fi
        print_success "Docker container '$CONTAINER' is running"
    else
        if ! command -v mysql &> /dev/null; then
            print_warning "MySQL client not found."
            print_info "Checking if Docker container is available..."
            
            if command -v docker &> /dev/null && docker ps --format '{{.Names}}' | grep -q "^${CONTAINER}$"; then
                print_info "Docker container found! Switching to Docker mode."
                USE_DOCKER="1"
            else
                print_error "Neither MySQL client nor Docker container available."
                print_info "Options:"
                print_info "  1. Install MySQL client: apt-get install mysql-client"
                print_info "  2. Start Docker container: docker-compose up -d"
                print_info "  3. Run with USE_DOCKER=1: USE_DOCKER=1 bash $0"
                exit 1
            fi
        else
            print_success "MySQL client found"
        fi
    fi
}

check_sql_file() {
    if [ ! -f "$SQL_FILE" ]; then
        print_error "SQL file not found: $SQL_FILE"
        exit 1
    fi
    print_success "SQL setup file found"
}

get_db_password() {
    if [ -z "$DB_PASSWORD" ]; then
        echo -e "${YELLOW}Enter MySQL password for user '$DB_USER':${NC}"
        read -s DB_PASSWORD
        echo ""
        export DB_PASSWORD
    fi
}

test_connection() {
    print_info "Testing database connection..."
    if mysql_exec -e "SELECT 1;" &> /dev/null; then
        print_success "Database connection successful"
        return 0
    else
        print_error "Database connection failed"
        print_info "Please check your database credentials and try again"
        exit 1
    fi
}

backup_existing_db() {
    print_info "Checking for existing database..."

    if mysql_exec -e "USE $DB_NAME;" 2>/dev/null; then
        print_warning "Database '$DB_NAME' already exists"
        echo -e "${YELLOW}Do you want to DROP and recreate it? (yes/no):${NC}"
        read -r response

        case "$response" in
            [Yy]|[Yy][Ee][Ss])
                BACKUP_FILE="$SCRIPT_DIR/backup_${DB_NAME}_$(date +%Y%m%d_%H%M%S).sql"
                print_info "Creating backup at: $BACKUP_FILE"

                if [ "$USE_DOCKER" = "1" ]; then
                    docker exec "$CONTAINER" mysqldump -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" > "$BACKUP_FILE" 2>/dev/null || {
                        print_warning "Backup failed, but continuing..."
                    }
                else
                    mysqldump -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" > "$BACKUP_FILE" 2>/dev/null || {
                        print_warning "Backup failed, but continuing..."
                    }
                fi

                if [ -f "$BACKUP_FILE" ] && [ -s "$BACKUP_FILE" ]; then
                    print_success "Backup created successfully"
                fi

                print_info "Dropping existing database..."
                mysql_exec -e "DROP DATABASE IF EXISTS $DB_NAME;" 2>/dev/null
                print_success "Existing database dropped"
                ;;
            *)
                print_error "Setup cancelled by user"
                exit 0
                ;;
        esac
    else
        print_info "Database '$DB_NAME' does not exist (will be created)"
    fi
}

run_sql_setup() {
    print_info "Running SQL setup script..."
    print_info "This may take a minute..."

    if mysql_exec < "$SQL_FILE" 2>&1 | grep -v "Warning"; then
        print_success "Database setup completed successfully"
        return 0
    else
        print_error "SQL setup failed"
        exit 1
    fi
}

verify_setup() {
    print_info "Verifying database setup..."

    # Check users
    USER_COUNT=$(mysql_exec_db -se "SELECT COUNT(*) FROM users;" 2>/dev/null || echo "0")
    if [ "$USER_COUNT" -gt 0 ] 2>/dev/null; then
        print_success "Users table populated ($USER_COUNT users)"
    else
        print_warning "Users table is empty"
    fi

    # Check therapists
    THERAPIST_COUNT=$(mysql_exec_db -se "SELECT COUNT(*) FROM therapists;" 2>/dev/null || echo "0")
    if [ "$THERAPIST_COUNT" -gt 0 ] 2>/dev/null; then
        print_success "Therapists table populated ($THERAPIST_COUNT therapists)"
    else
        print_warning "Therapists table is empty"
    fi

    # Check bookings
    BOOKING_COUNT=$(mysql_exec_db -se "SELECT COUNT(*) FROM bookings;" 2>/dev/null || echo "0")
    if [ "$BOOKING_COUNT" -gt 0 ] 2>/dev/null; then
        print_success "Bookings table populated ($BOOKING_COUNT bookings)"
    else
        print_warning "Bookings table is empty"
    fi

    # Check Better Auth columns
    if mysql_exec_db -e "DESCRIBE users;" 2>/dev/null | grep -q "banned"; then
        print_success "Better Auth admin plugin columns present"
    else
        print_error "Better Auth admin plugin columns missing"
    fi
}

print_summary() {
    print_header "Setup Complete!"

    echo -e "${GREEN}Database Information:${NC}"
    if [ "$USE_DOCKER" = "1" ]; then
        echo -e "  Mode:     Docker (container: $CONTAINER)"
    else
        echo -e "  Host:     $DB_HOST:$DB_PORT"
    fi
    echo -e "  Database: $DB_NAME"
    echo -e "  User:     $DB_USER"

    echo ""
    echo -e "${GREEN}Test Users Created (Schema Only - See Next Steps):${NC}"
    echo -e "  ${BLUE}Admin:${NC}      admin@mindweal.in / Test123!"
    echo -e "  ${BLUE}Reception:${NC}  reception@mindweal.in / Test123!"
    echo -e "  ${BLUE}Therapist:${NC}  dr.sharma@mindweal.in / Test123!"
    echo -e "  ${BLUE}Therapist:${NC}  dr.verma@mindweal.in / Test123!"
    echo -e "  ${BLUE}Therapist:${NC}  dr.singh@mindweal.in / Test123!"
    echo -e "  ${BLUE}Client:${NC}     client1@example.com / Test123!"
    echo -e "  ${BLUE}Client:${NC}     client2@example.com / Test123!"
    echo -e "  ${BLUE}Client:${NC}     client3@example.com / Test123!"

    echo ""
    echo -e "${YELLOW}IMPORTANT - Next Steps:${NC}"
    echo -e "  1. User passwords need to be set via Better Auth"
    echo -e "  2. Either run: ${BLUE}node create-test-users.js${NC}"
    echo -e "  3. Or manually sign up each user via your application"

    echo ""
    echo -e "${GREEN}Documentation:${NC}"
    echo -e "  See ${BLUE}TESTING_DATABASE_SETUP.md${NC} for detailed information"

    echo ""
    echo -e "${GREEN}Quick Test:${NC}"
    if [ "$USE_DOCKER" = "1" ]; then
        echo -e "  docker exec -it $CONTAINER mysql -u $DB_USER -p $DB_NAME"
    else
        echo -e "  mysql -h $DB_HOST -P $DB_PORT -u $DB_USER -p $DB_NAME"
    fi
    echo -e "  > SELECT role, COUNT(*) FROM users GROUP BY role;"
    echo ""
}

main() {
    print_header "Mindweal Testing Database Setup"

    print_info "Configuration:"
    echo "  Database Host: $DB_HOST:$DB_PORT"
    echo "  Database Name: $DB_NAME"
    echo "  Database User: $DB_USER"
    if [ "$USE_DOCKER" = "1" ]; then
        echo "  Mode:          Docker (container: $CONTAINER)"
    fi
    echo ""

    # Pre-flight checks
    check_prerequisites
    check_sql_file
    get_db_password
    test_connection

    # Setup process
    backup_existing_db
    run_sql_setup
    verify_setup

    # Summary
    print_summary

    print_success "All done!"
}

# Run main function
main
