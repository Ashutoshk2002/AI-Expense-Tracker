/* eslint-disable no-unused-vars */
const { Op } = require("sequelize");
class PaginationHelper {
  constructor(defaultLimit = 9, maxLimit = 100) {
    this.defaultLimit = defaultLimit;
    this.maxLimit = maxLimit;
  }

  /**
   * Parse and validate pagination parameters
   * @param {Object} query - Express query object
   * @returns {Object} Validated pagination parameters
   */
  getPaginationParams(query) {
    const page = Math.max(1, parseInt(query.page) || 1);
    let limit = Math.max(1, parseInt(query.limit) || this.defaultLimit);
    limit = Math.min(limit, this.maxLimit);
    const offset = (page - 1) * limit;

    return { page, limit, offset };
  }

  /**
   * Parse and validate sorting parameters
   * @param {Object} query - Express query object
   * @param {Array} allowedFields - Array of fields allowed for sorting
   * @returns {Array} Sequelize compatible sort array
   */
  getSortParams(query, allowedFields) {
    const sort = query.sort || "";
    const sortArray = [];

    sort.split(",").forEach((item) => {
      const trimmed = item.trim();
      if (trimmed) {
        const isDesc = trimmed.startsWith("-");
        const field = isDesc ? trimmed.substring(1) : trimmed;

        if (allowedFields.includes(field)) {
          sortArray.push([field, isDesc ? "DESC" : "ASC"]);
        }
      }
    });

    return sortArray.length ? sortArray : [["createdAt", "DESC"]];
  }

  /**
   * Parse and validate filter parameters
   * @param {Object} query - Express query object
   * @param {Object} filterConfig - Configuration for allowed filters
   * @returns {Object} Sequelize compatible where clause
   */
  getFilterParams(query, filterConfig) {
    const whereClause = {};

    const { page, limit, sort, ...filterQuery } = query;

    Object.entries(filterQuery).forEach(([key, value]) => {
      if (filterConfig[key]) {
        const config = filterConfig[key];

        switch (config.type) {
          case "exact":
            whereClause[key] = value;
            break;
          case "like":
            whereClause[key] = { [Op.like]: `%${value}%` };
            break;
          case "in":
            whereClause[key] = {
              [Op.in]: Array.isArray(value) ? value : value.split(","),
            };
            break;
          case "between":
            if (Array.isArray(value) && value.length === 2) {
              whereClause[key] = { [Op.between]: value };
            }
            break;
          case "range": {
            const rangeValues = {};
            if (query[`${key}_min`]) {
              rangeValues[Op.gte] = parseFloat(query[`${key}_min`]);
            }
            if (query[`${key}_max`]) {
              rangeValues[Op.lte] = parseFloat(query[`${key}_max`]);
            }
            if (Object.keys(rangeValues).length > 0) {
              whereClause[key] = rangeValues;
            }
            break;
          }
          case "boolean":
            whereClause[key] = value === "true";
            break;
          case "custom":
            if (typeof config.process === "function") {
              const processed = config.process(value);
              if (processed) {
                if (key === "search") {
                  Object.assign(whereClause, processed);
                } else {
                  whereClause[key] = processed;
                }
              }
            }
            break;
        }
      }
    });
    return whereClause;
  }

  /**
   * Format pagination response
   * @param {Object} data - Sequelize findAndCountAll result
   * @param {number} page - Current page
   * @param {number} limit - Items per page
   * @returns {Object} Formatted pagination response
   */
  formatResponse(data, page, limit) {
    const { count, rows } = data;
    const totalPages = Math.ceil(count / limit);

    return {
      data: rows,
      pagination: {
        totalItems: count,
        totalPages,
        currentPage: page,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }
}

module.exports = { PaginationHelper };
