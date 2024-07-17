import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({
  tableName: 'posts',
  timestamps: true,
})
export class PostModel extends Model<PostModel> {
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  title: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  content: string;
}
