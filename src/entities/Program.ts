import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

export type ProgramCategory = "therapy-service" | "professional-programs" | "workshop";

@Entity("programs")
export class Program {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ length: 255 })
  title!: string;

  @Column({ length: 255, unique: true })
  slug!: string;

  @Column("text")
  description!: string;

  @Column({ length: 100 })
  duration!: string;

  @Column({ type: "varchar", length: 500, nullable: true })
  coverImage!: string | null;

  @Column("json", { nullable: true })
  benefits!: string[] | null;

  @Column({
    type: "enum",
    enum: ["therapy-service", "professional-programs", "workshop"],
    default: "therapy-service",
  })
  category!: ProgramCategory;

  @Column({ type: "enum", enum: ["draft", "published"], default: "draft" })
  status!: "draft" | "published";

  @Column({ default: true })
  isActive!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
