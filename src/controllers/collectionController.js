const Collection = require("../models/Collection");

// Create a new collection
const createCollection = async (req, res) => {
  const { name, description, requests } = req.body;
  const userId = req.user.id;

  try {
    const newCollection = new Collection({
      userId,
      name,
      description,
      requests,
    });

    await newCollection.save();
    res.status(201).json(newCollection);
  } catch (err) {
    res.status(500).json({ message: "Failed to create collection", error: err.message });
  }
};

// Get all collections for a user
const getCollections = async (req, res) => {
  const userId = req.user.id;

  try {
    const collections = await Collection.find({ userId });
    res.status(200).json(collections);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch collections", error: err.message });
  }
};

// Add a request to an existing collection
const addRequestToCollection = async (req, res) => {
  const { collectionId } = req.params;
  const { method, url, headers, body } = req.body;

  try {
    const collection = await Collection.findById(collectionId);

    if (!collection) {
      return res.status(404).json({ message: "Collection not found" });
    }

    collection.requests.push({ method, url, headers, body });
    await collection.save();

    res.status(200).json({ message: "Request added to collection", collection });
  } catch (err) {
    res.status(500).json({ message: "Failed to add request to collection", error: err.message });
  }
};

// Delete a collection
const deleteCollection = async (req, res) => {
  const { collectionId } = req.params;

  try {
    const collection = await Collection.findById(collectionId);

    if (!collection) {
      return res.status(404).json({ message: "Collection not found" });
    }

    await collection.deleteOne();
    res.status(200).json({ message: "Collection deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete collection", error: err.message });
  }
};

const exportCollection = async (req, res) => {
  const { collectionId } = req.params;

  try {
    const collection = await Collection.findById(collectionId);

    if (!collection) {
      return res.status(404).json({ message: "Collection not found" });
    }

    res.setHeader("Content-Type", "application/json");
    res.setHeader("Content-Disposition", `attachment; filename=${collection.name}.json`);
    res.status(200).send(JSON.stringify(collection));
  } catch (err) {
    res.status(500).json({ message: "Failed to export collection", error: err.message });
  }
};

const importCollection = async (req, res) => {
  try {
    const fileData = JSON.parse(req.file.buffer.toString());
    const { name, description, requests } = fileData;

    if (!name || !requests) {
      return res.status(400).json({ message: "Invalid collection format" });
    }

    const newCollection = new Collection({
      userId: req.user.id,
      name,
      description,
      requests,
    });

    await newCollection.save();
    res.status(201).json(newCollection);
  } catch (err) {
    res.status(500).json({ message: "Failed to import collection", error: err.message });
  }
};

const duplicateCollection = async (req, res) => {
  const { collectionId } = req.params;

  try {
    const collection = await Collection.findById(collectionId);

    if (!collection) {
      return res.status(404).json({ message: "Collection not found" });
    }

    const duplicatedCollection = new Collection({
      userId: req.user.id,
      name: `${collection.name} (Copy)`,
      description: collection.description,
      requests: collection.requests,
    });

    await duplicatedCollection.save();
    res.status(201).json(duplicatedCollection);
  } catch (err) {
    res.status(500).json({ message: "Failed to duplicate collection", error: err.message });
  }
};

const shareCollection = async (req, res) => {
  const { collectionId } = req.params;
  const { sharedWithUserId } = req.body;

  try {
    const collection = await Collection.findById(collectionId);

    if (!collection) {
      return res.status(404).json({ message: "Collection not found" });
    }

    if (collection.sharedWith.includes(sharedWithUserId)) {
      return res.status(400).json({ message: "User is already a collaborator" });
    }

    collection.sharedWith.push(sharedWithUserId);
    await collection.save();

    res.status(200).json({ message: "Collection shared successfully", collection });
  } catch (err) {
    res.status(500).json({ message: "Failed to share collection", error: err.message });
  }
};

const searchAndFilterCollections = async (req, res) => {
  const { query, shared, startDate, endDate } = req.query;

  try {
    const filter = { userId: req.user.id };

    if (query) {
      filter.name = { $regex: query, $options: "i" };
    }

    if (shared === "true") {
      filter.sharedWith = { $exists: true, $not: { $size: 0 } };
    } else if (shared === "false") {
      filter.sharedWith = { $size: 0 };
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.createdAt.$lte = new Date(endDate);
      }
    }

    const collections = await Collection.find(filter).sort({ createdAt: -1 });

    res.status(200).json(collections);
  } catch (err) {
    res.status(500).json({ message: "Failed to search and filter collections", error: err.message });
  }
};


module.exports = { createCollection, getCollections, addRequestToCollection, deleteCollection, exportCollection, importCollection, duplicateCollection, shareCollection, searchAndFilterCollections };