import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { AuthSession } from 'src/auth/decorators/auth.decorator';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePostDto, DeletePostDto, EditPostDto, GetPostDto } from './dto';

@Injectable()
export class PostService {
  constructor(private prisma: PrismaService) {}

  private validateObjectValues(obj: { [key: string]: any }) {
    // Check if at least 1 value exists
    // Get the keys for all the fields in `body`
    const keys = Object.keys(obj);

    // Create an array to store all the values from `body`
    let values: (string | null)[] = [];

    // Store every value from `body` in `values`
    keys.forEach((key) => {
      values.push(obj[key]);
    });

    // Filter every `null` value
    values = values.filter((value) => value !== null);

    return {
      success: values.length <= 0 ? false : true,
    };
  }

  async createPost(session: AuthSession, body: CreatePostDto) {
    const { success } = this.validateObjectValues(body);

    // Check if there is at least 1 non-null value in the `values` list taken from `body`
    if (!success) {
      throw new HttpException(
        'You must provide at least 1 value!',
        HttpStatus.NOT_ACCEPTABLE,
      );
    }

    const newPost = await this.prisma.post.create({
      data: {
        ...body,
        userId: session.userId,
      },
    });

    return newPost;
  }

  async deletePost(session: AuthSession, body: DeletePostDto) {
    // Find the existing post
    const existingPost = await this.prisma.post.findUnique({
      where: {
        id: body.postId,
      },
    });
    if (!existingPost) {
      throw new HttpException('Could not find post!', HttpStatus.NOT_FOUND);
    }

    // Verify if the existing post belongs to the user requesting
    const isAuthorized = existingPost.userId === session.userId;
    if (!isAuthorized) {
      throw new HttpException(
        'This post does not belong to you!',
        HttpStatus.UNAUTHORIZED,
      );
    }

    // If the post belongs to the user requesting, delete it
    const deletedPost = await this.prisma.post.delete({
      where: {
        id: existingPost.id,
      },
    });

    return deletedPost;
  }

  async editPost(session: AuthSession, body: EditPostDto) {
    const { success } = this.validateObjectValues({
      textContent: body.textContent,
      code: body.code,
    });

    // Check if there is at least 1 non-null value in the `values` list taken from `body`
    if (!success) {
      throw new HttpException(
        'You must provide at least 1 value!',
        HttpStatus.NOT_ACCEPTABLE,
      );
    }

    // Find the existing post
    const existingPost = await this.prisma.post.findUnique({
      where: {
        id: body.postId,
      },
    });
    if (!existingPost) {
      throw new HttpException('Could not find post!', HttpStatus.NOT_FOUND);
    }

    // Verify if the existing post belongs to the user requesting
    const isAuthorized = existingPost.userId === session.userId;
    if (!isAuthorized) {
      throw new HttpException(
        'This post does not belong to you!',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const editedPost = await this.prisma.post.update({
      where: {
        id: body.postId,
      },
      data: {
        textContent: body.textContent,
        code: body.code,
        updatedAt: new Date(Date.now()),
      },
    });

    return editedPost;
  }

  async getHomepagePosts() {
    return await this.prisma.post.findMany({
      include: {
        comments: true,
        likes: true,
      },
    });
  }

  async getPost(body: GetPostDto) {
    const post = await this.prisma.post.findUnique({
      where: {
        id: body.postId,
      },
      include: {
        comments: {
          include: {
            likes: true,
            post: true,
            user: true,
            replies: {
              include: {
                likes: true,
                user: true,
                to: true,
              },
            },
          },
        },
      },
    });
    if (!post) {
      throw new HttpException('Could not find post!', HttpStatus.NOT_FOUND);
    }

    return post;
  }
}
