import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("team_members")
export class TeamMember {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 255 })
  name!: string;

  @Column({ type: "varchar", length: 255, unique: true })
  slug!: string;

  @Column({ type: "varchar", length: 255 })
  role!: string;

  @Column({ type: "varchar", length: 500, nullable: true })
  qualifications!: string | null;

  @Column({ type: "text" })
  bio!: string;

  @Column({ type: "text", nullable: true })
  photoUrl!: string | null;

  @Column({ type: "varchar", length: 255, nullable: true })
  email!: string | null;

  @Column({ type: "varchar", length: 50, nullable: true })
  phone!: string | null;

  @Column({ type: "varchar", length: 255, nullable: true })
  location!: string | null;

  @Column("json", { nullable: true })
  educationalQualifications!: string[] | null;

  @Column("json", { nullable: true })
  professionalExperience!: string[] | null;

  @Column("json", { nullable: true })
  areasOfExpertise!: string[] | null;

  @Column({ type: "varchar", length: 255, nullable: true })
  therapeuticApproach!: string | null;

  @Column("json", { nullable: true })
  therapyModalities!: string[] | null;

  @Column("json", { nullable: true })
  servicesOffered!: string[] | null;

  @Column("json", { nullable: true })
  focusAreas!: string[] | null;

  @Column("json", { nullable: true })
  professionalValues!: string[] | null;

  @Column({ type: "text", nullable: true })
  quote!: string | null;

  @Column({ type: "int", default: 0 })
  displayOrder!: number;

  @Column({ type: "boolean", default: true })
  isActive!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
