import {
  Model,
  Table,
  Column,
  DataType,
  CreatedAt,
  UpdatedAt,
} from 'sequelize-typescript';

@Table({
  tableName: 'subscribers',
  timestamps: true,
  paranoid: false,
})
export class SubscriberModel extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  id: number;

  @Column
  user_id: string;

  @Column
  user_name: string;

  @Column
  user_link: string;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 1000,
  })
  user_limit: number;

  @Column(DataType.JSON)
  extra: JSON;

  @CreatedAt
  created_at: Date;

  @UpdatedAt
  updated_at: Date;
}

export default SubscriberModel;
