import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("client_profiles")
export class ClientProfile {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ unique: true })
  userId!: string;

  @Column({ type: "varchar", length: 100, nullable: true })
  emergencyContactName!: string | null;

  @Column({ type: "varchar", length: 20, nullable: true })
  emergencyContactPhone!: string | null;

  @Column({ type: "varchar", length: 50, nullable: true })
  emergencyContactRelationship!: string | null;

  @Column({ default: false })
  consentFormSigned!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
