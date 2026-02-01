import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
} from "typeorm";
import { TeamMember } from "./TeamMember";

@Entity("blog_posts")
export class BlogPost {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ type: "varchar", length: 255, unique: true })
    slug!: string;

    @Column({ type: "enum", enum: ["draft", "published"], default: "draft" })
    status!: "draft" | "published";

    @Column({ default: true })
    isActive!: boolean;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;

    @Column({ type: "varchar", length: 255 })
    title!: string;

    @Column({ type: "text", nullable: true })
    excerpt!: string | null;

    @Column({ type: "text" })
    content!: string;

    @Column({ type: "varchar", length: 500, nullable: true })
    coverImage!: string | null;

    @Column({
        type: "enum",
        enum: ["wellness-tips", "practice-news", "professional-insights", "resources"],
    })
    category!: "wellness-tips" | "practice-news" | "professional-insights" | "resources";

    @Column({ type: "json", nullable: true })
    tags!: string[] | null;

    @Column({ default: false })
    isFeatured!: boolean;

    @Column({ type: "int", nullable: true })
    featuredOrder!: number | null;

    @Column({ type: "uuid", nullable: true })
    authorId!: string | null;

    @ManyToOne(() => TeamMember, { nullable: true })
    @JoinColumn({ name: "authorId" })
    author!: TeamMember | null;

    @Column({ type: "varchar", length: 255, nullable: true })
    authorName!: string | null;

    @Column({ type: "varchar", length: 255, nullable: true })
    metaTitle!: string | null;

    @Column({ type: "text", nullable: true })
    metaDescription!: string | null;

    @Column({ type: "datetime", nullable: true })
    publishedAt!: Date | null;
}
