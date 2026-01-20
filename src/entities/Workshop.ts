import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("workshops")
export class Workshop {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ length: 255 })
  title!: string;

  @Column({ length: 255, unique: true })
  slug!: string;

  @Column("text")
  description!: string;

  @Column({ type: "datetime" })
  date!: Date;

  @Column({ length: 100 })
  duration!: string;

  @Column({ type: "int", default: 20 })
  capacity!: number;

  @Column({ length: 500, nullable: true })
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
