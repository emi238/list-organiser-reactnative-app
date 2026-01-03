import fetch from "node-fetch";

// Base URL for the Books Form RESTful API
const API_BASE_URL = "https://comp2140a3.uqcloud.net/api";

// JWT token for authorization, replace with your actual token HERE
const JWT_TOKEN = "";

// Your UQ student username, used for row-level security to retrieve your records
const USERNAME = '';

/**
 * Helper function to handle API requests.
 * It sets the Authorization token and optionally includes the request body.
 * 
 * @param {string} endpoint - The API endpoint to call (e.g., "/form", "/field").
 * @param {string} [method='GET'] - The HTTP method to use (GET, POST, PATCH).
 * @param {object|null} [body=null] - The request body to send, typically for POST or PATCH.
 * @returns {Promise<object>} - The JSON response from the API.
 * @throws Will throw an error if the HTTP response is not OK.
 */
export async function apiRequest(endpoint, method = "GET", body = null) {
  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${JWT_TOKEN}`,
    },
  };

  if (method === "POST" || method === "PATCH") {
    options.headers["Prefer"] = "return=representation";
  }

  if (body) {
    options.body = JSON.stringify({ ...body, username: USERNAME });
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
  
  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`HTTP error! status: ${response.status} – ${errText}`);
  }

  return response.json();
}

// FORMS
/**
 * Function to get all forms for the current user.
 * 
 * @returns {Promise<Array>} - Array of form objects.
 */
export async function getAllForms() {
  return apiRequest("/form");
}

/**
 * Function to get a specific form by ID.
 * 
 * @param {number} formId - The ID of the form to retrieve.
 * @returns {Promise<object>} - The form object.
 */
export async function getFormById(formId) {
  return apiRequest(`/form?id=eq.${formId}`);
}

/**
 * Function to create a new form called "Books".
 * @param {number} formdata - The form data
 * @returns {Promise<object>} - The created form object.
 */
export async function createForm(formdata) {
  return apiRequest("/form", "POST", formdata);
}

/**
 * Function to update a form
 */
export async function updateForm(formId, formdata) {
  return apiRequest(`/form?id=eq.${formId}`, "PATCH", formdata);
}

/**
 * Function to delete a form by ID
 * @param {number} formId - The ID of the form to delete
 * @returns {Promise<object>} - The deletion response
 */
export async function deleteForm(formId) {
  const response = await fetch(`${API_BASE_URL}/form?id=eq.${formId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${JWT_TOKEN}`,
    },
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`HTTP error! status: ${response.status} – ${errText}`);
  }
  
  return { success: true, message: 'Form deleted successfully' };
}

// FIELDS
/**
 * Function to insert a single field for the form.
 * Call this function once for each field you want to add.
 * 
 * @param {number} formId - The ID of the form to attach this field to.
 * @param {object} field - The field definition object.
 * @returns {Promise<object>} - The created field object.
 */
export async function insertField(formId, field) {
  return apiRequest("/field", "POST", {
    ...field,
    form_id: formId,
  });
}

/**
 * Function to get all fields for a specific form.
 * 
 * @param {number} formId - The ID of the form.
 * @returns {Promise<Array>} - Array of field objects.
 */
export async function getFieldsByFormId(formId) {
  return apiRequest(`/field?form_id=eq.${formId}`);
}

/**
 * Function to get a specific field by ID.
 * 
 * @param {number} fieldId - The ID of the field to retrieve.
 * @returns {Promise<object>} - The field object.
 */
export async function getFieldById(fieldId) {
  return apiRequest(`/field?id=eq.${fieldId}`);
}

// RECORDS 
/**
 * Function to insert a single record (book entry) into the form.
 * 
 * @param {number} formId - The ID of the form to attach this record to.
 * @param {object} record - The record data (with a "values" object).
 * @returns {Promise<object>} - The created record object.
 */
export async function insertRecord(formId, record) {
  return apiRequest("/record", "POST", {
    ...record,
    form_id: formId,
  });
}

/**
 * Function to get all records for a specific form.
 * 
 * @param {number} formId - The ID of the form.
 * @returns {Promise<Array>} - Array of record objects.
 */
export async function getRecordsByFormId(formId) {
  return apiRequest(`/record?form_id=eq.${formId}`);
}

/**
 * Function to get all records.
 * 
 * @returns {Promise<Array>} - Array of record objects.
 */
export async function getRecords() {
  return apiRequest("/record", "GET");
}

/**
 * Function to get a specific record by ID.
 * 
 * @param {number} recordId - The ID of the record to retrieve.
 * @returns {Promise<object>} - The record object.
 */
export async function getRecordById(recordId) {
  return apiRequest(`/record?id=eq.${recordId}`);
}

/**
 * Function to delete a record by ID
 * @param {number} recordId - The ID of the record to delete
 * @returns {Promise<object>} - The deletion response
 */
export async function deleteRecord(recordId) {
  const response = await fetch(`${API_BASE_URL}/record?id=eq.${recordId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${JWT_TOKEN}`,
    },
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`HTTP error! status: ${response.status} – ${errText}`);
  }
  
  return { success: true, message: 'Record deleted successfully' };
}


// MAPS FUNCTION 
export default function App() {
    return (
        <ShowMap />
    );
}


/**
 * Filter records using PostgREST JSONB query syntax
 * @param {number} formId - Form ID
 * @param {Array} filters - Array of filter objects
 * @returns {Promise<Array>} Filtered records
 */
export async function filterRecordsByCriteria(formId, filters = []) {
  if (filters.length === 0) {
    return getRecordsByFormId(formId);
  }

  let query = `/record?form_id=eq.${formId}`;
  
  filters.forEach((filter, index) => {
    const field = filter.field;
    const operator = filter.operator;
    const value = filter.value;
    
    // URL encode the field name and build the query parameter
    const encodedField = encodeURIComponent(`"${field}"`);
    
    // Determine if we should use ->> (text) or -> (numeric) operator
    const jsonOperator = filter.isNumeric ? '-' : '-%3E'; // -> for numeric, ->> for text
    
    let queryParam = '';
    
    switch (operator) {
      case 'eq':
        queryParam = `values${jsonOperator}${encodedField}=eq.${encodeURIComponent(value)}`;
        break;
      case 'ilike':
        queryParam = `values${jsonOperator}${encodedField}=ilike.*${encodeURIComponent(value)}*`;
        break;
      case 'like':
        queryParam = `values${jsonOperator}${encodedField}=like.${encodeURIComponent(value)}%`;
        break;
      case 'gt':
        queryParam = `values${jsonOperator}${encodedField}=gt.${encodeURIComponent(value)}`;
        break;
      case 'lt':
        queryParam = `values${jsonOperator}${encodedField}=lt.${encodeURIComponent(value)}`;
        break;
      case 'gte':
        queryParam = `values${jsonOperator}${encodedField}=gte.${encodeURIComponent(value)}`;
        break;
      case 'lte':
        queryParam = `values${jsonOperator}${encodedField}=lte.${encodeURIComponent(value)}`;
        break;
      default:
        return;
    }
    
    // For multiple filters, we need to use AND logic (PostgREST uses & for AND)
    if (index > 0) {
      query += '&';
    }
    query += queryParam;
  });

  return apiRequest(query);
}

/**
 * Simple filter for a single field
 */
export async function filterRecordsSimple(formId, field, operator, value) {
  const encodedField = encodeURIComponent(`"${field}"`);
  const isNumeric = false; // You might want to pass this as a parameter
  
  const jsonOperator = isNumeric ? '-' : '-%3E';
  
  let query = `/record?form_id=eq.${formId}`;
  
  switch (operator) {
    case 'eq':
      query += `&values${jsonOperator}${encodedField}=eq.${encodeURIComponent(value)}`;
      break;
    case 'ilike':
      query += `&values${jsonOperator}${encodedField}=ilike.*${encodeURIComponent(value)}*`;
      break;
    case 'like':
      query += `&values${jsonOperator}${encodedField}=like.${encodeURIComponent(value)}%`;
      break;
    case 'gt':
      query += `&values${jsonOperator}${encodedField}=gt.${encodeURIComponent(value)}`;
      break;
    case 'lt':
      query += `&values${jsonOperator}${encodedField}=lt.${encodeURIComponent(value)}`;
      break;
    case 'gte':
      query += `&values${jsonOperator}${encodedField}=gte.${encodeURIComponent(value)}`;
      break;
    case 'lte':
      query += `&values${jsonOperator}${encodedField}=lte.${encodeURIComponent(value)}`;
      break;
  }
  
  return apiRequest(query);
}