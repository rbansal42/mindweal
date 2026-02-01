import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("community_programs")
export class CommunityProgram {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ length: 255 })
  name!: string;

  @Column({ length: 255, unique: true })
  slug!: string;

  @Column("text")
  description!: string;

  @Column({ length: 255 })
  schedule!: string;

  @Column({ type: "varchar", length: 500, nullable: true })
  coverImage!: string | null;

  @Column({ type: "enum", enum: ["draft", "published"], default: "draft" })
  status!: "draft" | "published";

  @Column({ default: true })
  isActive!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
