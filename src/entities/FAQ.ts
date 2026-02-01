import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

export type FAQCategory = "therapy" | "booking" | "programs" | "general";

@Entity("faqs")
export class FAQ {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 500 })
  question!: string;

  @Column({ type: "text" })
  answer!: string;

  @Column({
    type: "enum",
    enum: ["therapy", "booking", "programs", "general"],
    default: "general",
  })
  category!: FAQCategory;

  @Column({ type: "int", default: 0 })
  displayOrder!: number;

  @Column({ type: "boolean", default: true })
  isActive!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
