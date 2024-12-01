import React, { useState } from "react";
import {
  Container,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
} from "@mui/material";

// const apigClient = apigClientFactory.newClient({
//   apiKey: process.env.REACT_APP_API_KEY, // Ensure API key is loaded from .env
// });
var apigClient = apigClientFactory.newClient({
  accessKey: process.env.ACCESS_KEY,
  secretKey: process.env.SECRET_KEY,
  region: "us-east-1", // OPTIONAL: The region where the API is deployed, by default this parameter is set to us-east-1
});


function App() {
  const [photo, setPhoto] = useState(null);
  const [customLabels, setCustomLabels] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState([]);
  const [uploadStatus, setUploadStatus] = useState("");
  const [searchStatus, setSearchStatus] = useState("");

  // Simulate photo upload
  const handleUpload = async () => {
    if (!photo) {
      setUploadStatus("Please select a photo.");
      return;
    }
    try {
      // Prepare the upload parameters
      console.log("Photo", photo);
      const params = {
        filename: photo.name,
        "x-amz-meta-customLabels": customLabels,
      };

      const additionalParams = {
        headers: {
          "x-amz-meta-customLabels": customLabels, // Pass custom labels in headers
          "Content-Type": photo.type,
        },
      };
      const reader = new FileReader();
      reader.onloadend = async (e) =>{
        const fileData = e.target.result.split(",")[1];
        const response = await apigClient.photosPut(
          params,
          fileData,
          additionalParams
        );
        console.log("RESPONSE", response);
        if (response.status === 200) {
          setUploadStatus("Photo uploaded successfully!");
          setPhoto(null);
          setCustomLabels("");
        }
      }
      reader.readAsDataURL(photo);
    } catch (error) {
      console.error("Upload failed:", error);
      setUploadStatus("Failed to upload photo. Please try again.");
    }
  };

  // Simulate search functionality
  const handleSearch = async () => {
    if (!searchQuery) {
      setUploadStatus("Please enter a search query.");
      return;
    }
    try {
      setSearchStatus("Searching...");
      const params = { q: searchQuery }; // Query parameter for /search
      const additionalParams = {
        headers: {
          "Content-Type": "application/json",
        },
      };
      const response = await apigClient.search2Options(params, {}, additionalParams);
      console.log("Search Response:", response);

      if (response.data.statusCode === "200" && response.data.data) {
        const parsedResults = JSON.parse(response.data.data.content); // Parse the response
        setResults(parsedResults); // Update results state
        setSearchStatus("");
      } else {
        setSearchStatus("No results found.");
        setResults([]);
      }

    } catch (error) {
      console.error("Search failed:", error);
      setSearchStatus("Failed to perform search. Please try again.");
    }




  };

  return (
    <Container maxWidth="md" style={{ marginTop: "20px" }}>
      <Typography variant="h4" gutterBottom>
        Photo Album (Local Demo)
      </Typography>

      {/* Upload Photo Section */}
      <div style={{ marginBottom: "20px" }}>
        <Typography variant="h6">Upload Photo</Typography>
        <TextField
          type="file"
          fullWidth
          margin="normal"
          InputLabelProps={{ shrink: true }}
          onChange={(e) => setPhoto(e.target.files[0])}
        />
        <TextField
          label="Enter custom labels (comma-separated)"
          fullWidth
          margin="normal"
          value={customLabels}
          onChange={(e) => setCustomLabels(e.target.value)}
        />
        <Button variant="contained" color="primary" onClick={handleUpload}>
          Upload
        </Button>
        {uploadStatus && (
          <Typography color="green" style={{ marginTop: "10px" }}>
            {uploadStatus}
          </Typography>
        )}
      </div>

      {/* Search Photo Section */}
      <div style={{ marginBottom: "20px" }}>
        <Typography variant="h6">Search Photos</Typography>
        <TextField
          label="Search for photos (e.g., 'dogs')"
          fullWidth
          margin="normal"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Button variant="contained" color="primary" onClick={handleSearch}>
          Search
        </Button>
      </div>

      {/* Results Section */}
      <div>
        <Typography variant="h6" gutterBottom>
          Results
        </Typography>
        <Grid container spacing={3}>
          {results.length > 0 ? (
            results.map((photo, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card>
                  <CardMedia
                    component="img"
                    image={photo.objectKey}
                    alt={`Photo ${index}`}
                    height="140"
                  />
                  <CardContent>
                    <Typography variant="body2">
                      Labels: {photo.labels.join(", ") || "No labels"}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))
          ) : (
            <Typography>No photos found.</Typography>
          )}
        </Grid>
      </div>
    </Container>
  );
}

export default App;
