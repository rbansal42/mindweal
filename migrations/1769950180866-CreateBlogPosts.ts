import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from "typeorm";

export class CreateBlogPosts1769950180866 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create blog_posts table
        await queryRunner.createTable(
            new Table({
                name: "blog_posts",
                columns: [
                    {
                        name: "id",
                        type: "varchar",
                        length: "36",
                        isPrimary: true,
                        generationStrategy: "uuid",
                    },
                    {
                        name: "slug",
                        type: "varchar",
                        length: "255",
                        isUnique: true,
                    },
                    {
                        name: "status",
                        type: "enum",
                        enum: ["draft", "published"],
                        default: "'draft'",
                    },
                    {
                        name: "isActive",
                        type: "boolean",
                        default: true,
                    },
                    {
                        name: "createdAt",
                        type: "datetime",
                        default: "CURRENT_TIMESTAMP",
                    },
                    {
                        name: "updatedAt",
                        type: "datetime",
                        default: "CURRENT_TIMESTAMP",
                        onUpdate: "CURRENT_TIMESTAMP",
                    },
                    {
                        name: "title",
                        type: "varchar",
                        length: "255",
                    },
                    {
                        name: "excerpt",
                        type: "text",
                        isNullable: true,
                    },
                    {
                        name: "content",
                        type: "text",
                    },
                    {
                        name: "coverImage",
                        type: "varchar",
                        length: "500",
                        isNullable: true,
                    },
                    {
                        name: "category",
                        type: "enum",
                        enum: ["wellness-tips", "practice-news", "professional-insights", "resources"],
                    },
                    {
                        name: "tags",
                        type: "json",
                        isNullable: true,
                    },
                    {
                        name: "isFeatured",
                        type: "boolean",
                        default: false,
                    },
                    {
                        name: "featuredOrder",
                        type: "int",
                        isNullable: true,
                    },
                    {
                        name: "authorId",
                        type: "varchar",
                        length: "36",
                        isNullable: true,
                    },
                    {
                        name: "authorName",
                        type: "varchar",
                        length: "255",
                        isNullable: true,
                    },
                    {
                        name: "metaTitle",
                        type: "varchar",
                        length: "255",
                        isNullable: true,
                    },
                    {
                        name: "metaDescription",
                        type: "text",
                        isNullable: true,
                    },
                    {
                        name: "publishedAt",
                        type: "datetime",
                        isNullable: true,
                    },
                ],
            }),
            true
        );

        // Create index on slug for faster lookups
        await queryRunner.createIndex(
            "blog_posts",
            new TableIndex({
                name: "IDX_blog_posts_slug",
                columnNames: ["slug"],
            })
        );

        // Create index on status for filtering published posts
        await queryRunner.createIndex(
            "blog_posts",
            new TableIndex({
                name: "IDX_blog_posts_status",
                columnNames: ["status"],
            })
        );

        // Create index on category for filtering by category
        await queryRunner.createIndex(
            "blog_posts",
            new TableIndex({
                name: "IDX_blog_posts_category",
                columnNames: ["category"],
            })
        );

        // Create index on publishedAt for sorting
        await queryRunner.createIndex(
            "blog_posts",
            new TableIndex({
                name: "IDX_blog_posts_publishedAt",
                columnNames: ["publishedAt"],
            })
        );

        // Create index on isFeatured for filtering featured posts
        await queryRunner.createIndex(
            "blog_posts",
            new TableIndex({
                name: "IDX_blog_posts_isFeatured",
                columnNames: ["isFeatured"],
            })
        );

        // Create foreign key to team_members table
        await queryRunner.createForeignKey(
            "blog_posts",
            new TableForeignKey({
                columnNames: ["authorId"],
                referencedTableName: "team_members",
                referencedColumnNames: ["id"],
                onDelete: "SET NULL",
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop the table (indexes and foreign keys will be dropped automatically)
        await queryRunner.dropTable("blog_posts");
    }

}
