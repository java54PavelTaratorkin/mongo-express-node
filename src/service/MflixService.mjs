import MongoConnection from '../mongo/MongoConnection.mjs'
import { ObjectId } from 'mongodb'
export default class MflixService {
    #moviesCollection
    #commentsCollection
    #connection
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
        commentDB._id = result.insertedId;
        return commentDB;
    }
    async updateCommentText({ text, commentId }) {
        const commentUpdated = await this.#commentsCollection.findOneAndUpdate(
            { _id: ObjectId.createFromHexString(commentId) },
            { $set: { text } },
            { returnNewDocument: true });
        return commentUpdated;
    }
    async deleteComment(id) {
        const toDeleteComment = await this.getComment(id);
        if(!toDeleteComment){
            throw {code: 404, text: "comment not found"};
        }
        await this.#commentsCollection.deleteOne({"_id":toDeleteComment._id});
        return toDeleteComment;
    }
    async getComment(id) {
        const mongoId = ObjectId.createFromHexString(id);
        const comment = await this.#commentsCollection.findOne({"_id":mongoId});
        return comment;
    }
    async getMostRatedMovies({genre, acter, year, amount}) {
        const filter = {...year && {year}, ...acter &&{cast: {'$regex':acter}},
         ...genre && {genres:genre}, 'imdb.rating':{'$ne':''}}
         const result = await this.#moviesCollection.find(filter)
         .sort({'imdb.rating':-1}).limit(amount).toArray();
         return result;
    }
    #toComment(commentDto) {
        const movieId = ObjectId.createFromHexString(commentDto.movie_id);
        return { ...commentDto, 'movie_id': movieId }
    }
}