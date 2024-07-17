import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { PostModel } from "./post.model";

@Module({
    imports: [
    SequelizeModule.forFeature([PostModel]),

    ],
})
export class PostModule {}