const mongoose = require('mogoose');

const mediaSchema = new mongoose.Schema(
    {
        source: { type: String, enum: ['openlibrary', 'jikan'], required: true},
        externalId: {type: String, required: true},
        type: {type: String, enum: ['book', 'manga', 'comic'], required: true},
        title: {type: String, required: true},
        authors: { type: [String], default: []},
        coverUrl: { type: String, default: null},
        year: {type: Number, default: null},
        description: {type: String, default: ''},
    },
    {timestamps: true}
);

// one document per title per source, which prevents duplicates
mediaSchema.index();