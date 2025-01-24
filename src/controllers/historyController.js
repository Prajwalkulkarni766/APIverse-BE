const History = require("../models/History");

const getHistory = async (req, res) => {
  const userId = req.user.id;
  const page = parseInt(req.query.page) || 1;  // Default to page 1 if not provided
  const limit = parseInt(req.query.limit) || 10;  // Default to 10 items per page
  const urlFilter = req.query.url || ''; // URL filter
  const statusFilter = req.query.status || ''; // Status filter
  const methodFilter = req.query.method || ''; // Method filter

  try {
    // Build filter conditions
    const filterConditions = { userId }; // Always filter by userId

    // Ignore filters if "all" is in status or method
    if (urlFilter) {
      filterConditions.url = { $regex: urlFilter, $options: 'i' }; // Case-insensitive search for URL
    }
    if (statusFilter && statusFilter.toLowerCase() !== 'all') {
      filterConditions.status = { $regex: statusFilter, $options: 'i' }; // Case-insensitive search for status
    }
    if (methodFilter && methodFilter.toLowerCase() !== 'all') {
      filterConditions.method = { $regex: methodFilter, $options: 'i' }; // Case-insensitive search for method
    }

    // Calculate the number of items to skip for pagination
    const skip = (page - 1) * limit;

    // Fetch filtered history data with pagination
    const history = await History.find(filterConditions)
      .sort({ createdAt: -1 }) // Sort by creation date
      .skip(skip) // Skip the number of items based on the page
      .limit(limit); // Limit the number of results per page

    // Get the total count of requests matching the filters
    const totalRequests = await History.countDocuments(filterConditions);

    // Calculate the total number of pages
    const totalPages = Math.ceil(totalRequests / limit);

    // Send the filtered history data along with the total count and pagination information
    res.status(200).json({
      totalRequests: totalRequests, // Total requests matching the filters
      totalPages: totalPages, // Total number of pages
      currentPage: page, // Current page
      history: history // Filtered history data
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch history", error: err.message });
  }
};

const deleteAllHistory = async (req, res) => {
  try {
    await History.deleteMany();
    res.status(200).json({ message: "History deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete history", error: err.message });
  }
};

const deleteHistory = async (req, res) => {
  const { id } = req.params;

  try {
    const history = await History.findById(id);

    if (!history) {
      return res.status(404).json({ message: "History not found" });
    }

    await history.deleteOne();
    res.status(200).json({ message: "History deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete history", error: err.message });
  }
};

const searchHistory = async (req, res) => {
  const { query } = req.query;
  const userId = req.user.id;

  try {
    const history = await History.find({
      userId,
      $or: [
        { url: { $regex: query, $options: "i" } },
        { method: { $regex: query, $options: "i" } },
        { statusCode: { $regex: query, $options: "i" } },
      ],
    }).sort({ createdAt: -1 });

    res.status(200).json(history);
  } catch (err) {
    res.status(500).json({ message: "Failed to search history", error: err.message });
  }
};


module.exports = { getHistory, deleteHistory, searchHistory, deleteAllHistory };