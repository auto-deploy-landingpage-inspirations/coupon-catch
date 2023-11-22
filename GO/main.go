package main

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/rs/cors"
)

// Define a simple struct for your API response
type ApiResponse struct {
	Message string `json:"message"`
}

// POST handler function
func PostHandler(w http.ResponseWriter, r *http.Request) {
	// Parse multipart form, 10 << 20 specifies a maximum upload of 10 MB files.
	if err := r.ParseMultipartForm(10 << 20); err != nil {
		log.Printf("Error parsing multipart form: %v", err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// FormFile returns the first file for the given key 'file'
	file, header, err := r.FormFile("image")
	if err != nil {
		log.Printf("Error retrieving the file: %v", err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	defer file.Close()

	// For this example, we're just printing out the details
	// In a real application, you would usually save the file to a server or process it
	log.Printf("Uploaded File: %+v\n", header.Filename)
	log.Printf("File Size: %+v\n", header.Size)
	log.Printf("MIME Header: %+v\n", header.Header)

	response := ApiResponse{Message: "File Uploaded Successfully"}
	json.NewEncoder(w).Encode(response)
}

func main() {
	// Initialize a new mux router
	router := mux.NewRouter()

	// Handle POST request
	router.HandleFunc("/api/post", PostHandler).Methods("POST")

	// Custom CORS settings
	corsOptions := cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:8100"},
		AllowedMethods:   []string{"GET", "POST", "OPTIONS"},
		AllowedHeaders:   []string{"Content-Type", "Authorization"},
		AllowCredentials: true, // If needed
	})

	// Apply CORS settings to our router
	handler := corsOptions.Handler(router)

	// Start server
	log.Println("Server is running on port 3020...")
	log.Fatal(http.ListenAndServe(":3020", handler))
}
