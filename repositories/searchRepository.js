const searchModel = require("../models/searchTerms");

const searchRepository = {
  postSearchTerms: async (id, searchTerms) => {
    // Accepts a single term or an array of terms
    try {
      const existingDoc = await searchModel.findOne({ id });

      if (existingDoc) {
        // If searchTerms is an array, push each term individually
        if (Array.isArray(searchTerms)) {
          searchTerms.forEach((term) => existingDoc.terms.push(term));
        } else {
          // If it's a single term, just push it
          existingDoc.terms.push(searchTerms);
        }

        // Keep only the latest 5 entries
        if (existingDoc.terms.length > 5) {
          existingDoc.terms = existingDoc.terms.slice(-5);
        }

        // Save the updated document
        await existingDoc.save();
        return existingDoc;
      } else {
        // Create a new document if it doesn't exist
        const newDoc = await searchModel.create({
          id: id,
          terms: Array.isArray(searchTerms)
            ? searchTerms.slice(-5)
            : [searchTerms],
        });
        return newDoc;
      }
    } catch (err) {
      return err;
    }
  },
  
  
};

module.exports = searchRepository;
