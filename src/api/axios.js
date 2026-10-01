import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
  headers: {
    "Content-Type": "application/json",
  },
});


// ======================================================
// REQUEST INTERCEPTOR
// Attach access token to every API request
// ======================================================

api.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("access_token");

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },

  (error) => {
    return Promise.reject(error);
  }
);


// ======================================================
// RESPONSE INTERCEPTOR
// Handle expired access token
// ======================================================

api.interceptors.response.use(

  // If API response is successful
  (response) => {
    return response;
  },


  // If API response has an error
  async (error) => {

    const originalRequest = error.config;


    // --------------------------------------------------
    // Check whether access token expired
    // --------------------------------------------------

    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {

      originalRequest._retry = true;


      // Get refresh token
      const refreshToken =
        localStorage.getItem("refresh_token");


      // ------------------------------------------------
      // No refresh token
      // ------------------------------------------------

      if (!refreshToken) {

        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user");

        window.location.href = "/";

        return Promise.reject(error);
      }


      // ------------------------------------------------
      // Request new access token
      // ------------------------------------------------

      try {

        const response = await axios.post(
          "http://127.0.0.1:8000/api/token/refresh/",
          {
            refresh: refreshToken,
          }
        );


        const newAccessToken =
          response.data.access;


        // Save new access token
        localStorage.setItem(
          "access_token",
          newAccessToken
        );



        
        // ------------------------------------------------
        // Retry original request with new token
        // ------------------------------------------------

        originalRequest.headers.Authorization =
          `Bearer ${newAccessToken}`;


        return api(originalRequest);

      } catch (refreshError) {

        // ----------------------------------------------
        // Refresh token also expired
        // ----------------------------------------------

        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user");

        window.location.href = "/";

        return Promise.reject(refreshError);
      }
    }


    return Promise.reject(error);
  }
);


export default api;