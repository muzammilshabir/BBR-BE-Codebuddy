import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { PermissionLevel } from '../../modulePolicy/enum/permission-enum';

@Schema({ timestamps: true })
export class Role extends Document {
  @Prop({ required: true, unique: true })
  roleName: string;

  @Prop({ required: true, enum: ['admin', 'seller', 'buyer'], default: 'admin' })
  userType: string; // The type of user this role applies to (admin, seller, buyer)

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdById: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  updatedById: Types.ObjectId;

  @Prop({
    type: [
      {
        moduleId: { type: Types.ObjectId, ref: 'ModulePolicy' },
        permissions: { type: [String], enum: PermissionLevel, required: true },
      },
    ],
    _id: false,
    default: [],
  })
  modulePermissions: {
    moduleId: Types.ObjectId; // The ModulePolicy ID
    permissions: PermissionLevel[]; // Array of permissions (read, edit, delete)
  }[];

  @Prop({ default: false })
  isDeleted: boolean;

  createdAt: Date;
  updatedAt: Date;
}

export const RoleSchema = SchemaFactory.createForClass(Role);
