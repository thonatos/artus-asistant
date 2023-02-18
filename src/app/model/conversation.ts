import {
  Model,
  Table,
  Column,
  DataType,
  CreatedAt,
  UpdatedAt,
} from 'sequelize-typescript';

@Table({
  tableName: 'conversations',
  timestamps: true,
  paranoid: false,
})
export class ConversationModel extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  id: number;

  @Column
  role: string;

  @Column(DataType.TEXT)
  content: string;

  @Column
  chat_id: string;

  @CreatedAt
  created_at: Date;

  @UpdatedAt
  updated_at: Date;
}

export default ConversationModel;
