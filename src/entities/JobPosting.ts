import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("job_postings")
export class JobPosting {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ length: 255 })
  title!: string;

  @Column({ length: 255, unique: true })
  slug!: string;

  @Column({ length: 100 })
  department!: string;

  @Column("text")
  description!: string;

  @Column("text", { nullable: true })
  requirements!: string | null;

  @Column({ length: 100 })
  location!: string;

  @Column({ type: "enum", enum: ["full-time", "part-time", "contract"], default: "full-time" })
  type!: "full-time" | "part-time" | "contract";

  @Column({ type: "enum", enum: ["draft", "published"], default: "draft" })
  status!: "draft" | "published";

  @Column({ default: true })
  isActive!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
