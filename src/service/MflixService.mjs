import MongoConnection from '../mongo/MongoConnection.mjs';
import { ObjectId } from 'mongodb';

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
        // Add a new comment to the database
        const commentDB = this.#toComment(commentDto);
        const result = await this.#commentsCollection.insertOne(commentDB);
        commentDB._id = result.insertedId;
        return commentDB;
    }

    #toComment(commentDto) {
        // Convert movie_id to ObjectId
        const movieId = ObjectId.createFromHexString(commentDto.movie_id);
        return { ...commentDto, movie_id: movieId };
    }

    async updateComment(commentDto) {
        // Update the text of a comment
        const commentId = ObjectId.createFromHexString(commentDto.commentId);
        const result = await this.#commentsCollection.updateOne(
            { _id: commentId },
            { $set: { text: commentDto.text } }
        );
        return result.modifiedCount;
    }

    async deleteComment(id) {
        // Delete a comment by ID
        const commentId = ObjectId.createFromHexString(id);
        const result = await this.#commentsCollection.deleteOne({ _id: commentId });
        return result.deletedCount;
    }

    async getCommentsByMovie(id) {
        // Retrieve comments by comment_id
        const commentId = ObjectId.createFromHexString(id);
        const result = await this.#commentsCollection.findOne({ _id: commentId });
        return result;
    }

    async findMostRatedMovies(query) {
        // Find the most IMDb-rated movies
        const { year, genre, actor, amount } = query;

        const pipeline = [
            {
                $match: {
                    ...(year && { year }),
                    ...(genre && { genres: genre }),
                    ...(actor && { cast: { $regex: actor, $options: "i" } }),
                },
            },
            { $sort: { "imdb.rating": -1 } },
            { $limit: amount }, 
            {
                $project: {
                    _id: 0,
                    title: 1,
                    year: 1,
                    "imdb.rating": 1,
                    genres: 1,
                    cast: 1,
                },
            },
        ];

        const movies = await this.#moviesCollection.aggregate(pipeline).toArray();
        return movies;
    }
}