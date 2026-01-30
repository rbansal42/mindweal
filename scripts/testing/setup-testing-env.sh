#!/bin/bash

##############################################################################
# Mindweal Testing Database Setup Script
##############################################################################
# This script automates the setup of a complete testing database
#
# Usage: ./setup-testing-env.sh
#
# Environment variables (optional):
#   DB_HOST       - Database host (default: localhost)
#   DB_PORT       - Database port (default: 3306)
#   DB_USER       - Database user (default: root)
#   DB_PASSWORD   - Database password (will prompt if not set)
#   DB_NAME       - Database name (default: mindweal)
##############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-3306}
DB_USER=${DB_USER:-root}
DB_NAME=${DB_NAME:-mindweal}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SQL_FILE="$SCRIPT_DIR/setup-testing-database.sql"

# Functions
print_header() {
    echo -e "\n${BLUE}==============================================================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}==============================================================================${NC}\n"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

check_mysql() {
    if ! command -v mysql &> /dev/null; then
        print_error "MySQL client not found. Please install MySQL client."
        exit 1
    fi
    print_success "MySQL client found"
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
        export DB_PASSWORD
    fi
}

test_connection() {
    print_info "Testing database connection..."
    if mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" -e "SELECT 1;" &> /dev/null; then
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

    if mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" -e "USE $DB_NAME;" 2>/dev/null; then
        print_warning "Database '$DB_NAME' already exists"
        echo -e "${YELLOW}Do you want to DROP and recreate it? (yes/no):${NC}"
        read -r response

        if [[ "$response" =~ ^[Yy][Ee][Ss]$ ]] || [[ "$response" =~ ^[Yy]$ ]]; then
            BACKUP_FILE="$SCRIPT_DIR/backup_${DB_NAME}_$(date +%Y%m%d_%H%M%S).sql"
            print_info "Creating backup at: $BACKUP_FILE"

            mysqldump -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" > "$BACKUP_FILE" 2>/dev/null || {
                print_warning "Backup failed, but continuing..."
            }

            if [ -f "$BACKUP_FILE" ] && [ -s "$BACKUP_FILE" ]; then
                print_success "Backup created successfully"
            fi

            print_info "Dropping existing database..."
            mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" -e "DROP DATABASE IF EXISTS $DB_NAME;" 2>/dev/null
            print_success "Existing database dropped"
        else
            print_error "Setup cancelled by user"
            exit 0
        fi
    else
        print_info "Database '$DB_NAME' does not exist (will be created)"
    fi
}

run_sql_setup() {
    print_info "Running SQL setup script..."
    print_info "This may take a minute..."

    if mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" < "$SQL_FILE" 2>&1 | grep -v "Warning"; then
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
    USER_COUNT=$(mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" -se "SELECT COUNT(*) FROM users;" 2>/dev/null)
    if [ "$USER_COUNT" -gt 0 ]; then
        print_success "Users table populated ($USER_COUNT users)"
    else
        print_warning "Users table is empty"
    fi

    # Check therapists
    THERAPIST_COUNT=$(mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" -se "SELECT COUNT(*) FROM therapists;" 2>/dev/null)
    if [ "$THERAPIST_COUNT" -gt 0 ]; then
        print_success "Therapists table populated ($THERAPIST_COUNT therapists)"
    else
        print_warning "Therapists table is empty"
    fi

    # Check bookings
    BOOKING_COUNT=$(mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" -se "SELECT COUNT(*) FROM bookings;" 2>/dev/null)
    if [ "$BOOKING_COUNT" -gt 0 ]; then
        print_success "Bookings table populated ($BOOKING_COUNT bookings)"
    else
        print_warning "Bookings table is empty"
    fi

    # Check Better Auth columns
    if mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" -e "DESCRIBE users;" 2>/dev/null | grep -q "banned"; then
        print_success "Better Auth admin plugin columns present"
    else
        print_error "Better Auth admin plugin columns missing"
    fi
}

print_summary() {
    print_header "Setup Complete!"

    echo -e "${GREEN}Database Information:${NC}"
    echo -e "  Host:     $DB_HOST:$DB_PORT"
    echo -e "  Database: $DB_NAME"
    echo -e "  User:     $DB_USER"

    echo -e "\n${GREEN}Test Users Created (Schema Only - See Next Steps):${NC}"
    echo -e "  ${BLUE}Admin:${NC}      admin@mindweal.in / Test123!"
    echo -e "  ${BLUE}Reception:${NC}  reception@mindweal.in / Test123!"
    echo -e "  ${BLUE}Therapist:${NC}  dr.sharma@mindweal.in / Test123!"
    echo -e "  ${BLUE}Therapist:${NC}  dr.verma@mindweal.in / Test123!"
    echo -e "  ${BLUE}Therapist:${NC}  dr.singh@mindweal.in / Test123!"
    echo -e "  ${BLUE}Client:${NC}     client1@example.com / Test123!"
    echo -e "  ${BLUE}Client:${NC}     client2@example.com / Test123!"
    echo -e "  ${BLUE}Client:${NC}     client3@example.com / Test123!"

    echo -e "\n${YELLOW}IMPORTANT - Next Steps:${NC}"
    echo -e "  1. User passwords need to be set via Better Auth"
    echo -e "  2. Either run: ${BLUE}node create-test-users.js${NC}"
    echo -e "  3. Or manually sign up each user via your application"

    echo -e "\n${GREEN}Documentation:${NC}"
    echo -e "  See ${BLUE}TESTING_DATABASE_SETUP.md${NC} for detailed information"

    echo -e "\n${GREEN}Quick Test:${NC}"
    echo -e "  mysql -h $DB_HOST -P $DB_PORT -u $DB_USER -p $DB_NAME"
    echo -e "  > SELECT role, COUNT(*) FROM users GROUP BY role;"

    echo ""
}

main() {
    print_header "Mindweal Testing Database Setup"

    print_info "Configuration:"
    echo "  Database Host: $DB_HOST:$DB_PORT"
    echo "  Database Name: $DB_NAME"
    echo "  Database User: $DB_USER"
    echo ""

    # Pre-flight checks
    check_mysql
    check_sql_file
    get_db_password
    test_connection

    # Setup process
    backup_existing_db
    run_sql_setup
    verify_setup

    # Summary
    print_summary

    print_success "All done! 🎉"
}

# Run main function
main
