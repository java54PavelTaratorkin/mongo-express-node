import MongoConnection from "../mongo/MongoConnection.mjs";
import { ObjectId } from "mongodb";
import { getError } from "../errors/errors.mjs";

export default class MflixService {
    #moviesCollection;
    #commentsCollection;
    #connection;

    constructor(uri, dbName, moviesCollection, commentsCollection) {
        this.#connection = new MongoConnection(uri, dbName);
        this.#moviesCollection = this.#connection.getCollection(moviesCollection);
        this.#commentsCollection = this.#connection.getCollection(commentsCollection);
    }

    shutdown() {
        this.#connection.closeConnection();
    }

    async addComment(commentDto) {
        const commentDB = this.#toComment(commentDto);
        const result = await this.#commentsCollection.insertOne(commentDB);
        if (!result.insertedId) {
            throw getError(500, "Failed to add comment");
        }
        commentDB._id = result.insertedId;
        return commentDB;
    }

    async updateCommentText({ text, commentId }) {
        const toUpdateComment = await this.getComment(commentId);
        const result = await this.#commentsCollection.updateOne(
            { _id: ObjectId.createFromHexString(commentId) },
            { $set: { text } }
        );
        if (!result.modifiedCount) {
            throw getError(500, "Failed to update comment text");
        }
        return { ...toUpdateComment, text };
    }

    async deleteComment(id) {
        const toDeleteComment = await this.getComment(id);
        const result = await this.#commentsCollection.deleteOne({ _id: toDeleteComment._id });
        if (!result.deletedCount) {
            throw getError(500, "Failed to delete comment");
        }
        return toDeleteComment;
    }

    async getComment(id) {
        const mongoId = ObjectId.createFromHexString(id);
        const comment = await this.#commentsCollection.findOne({ _id: mongoId });
        if (!comment) {
            throw getError(404, "Comment not found");
        }
        return comment;
    }

    async getMostRatedMovies({ genre, actor, year, amount }) {
        const filter = {
            ...(year && { year }),
            ...(actor && { cast: { $regex: actor, $options: "i" } }),
            ...(genre && { genres: genre }),
            "imdb.rating": { $ne: "" },
        };
    
        const result = await this.#moviesCollection
            .find(filter)
            .sort({ "imdb.rating": -1 })
            .limit(amount)
            .toArray();
    
        if (!result.length) {
            throw getError(404, "No movies found matching the criteria");
        }
    
        return result;
    }

    #toComment(commentDto) {
        const movieId = ObjectId.createFromHexString(commentDto.movie_id);
        return { ...commentDto, movie_id: movieId };
    }
}