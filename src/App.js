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

function App() {
  const [photo, setPhoto] = useState(null);
  const [customLabels, setCustomLabels] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState([]);
  const [uploadStatus, setUploadStatus] = useState("");

  // Simulate photo upload
  const handleUpload = () => {
    if (!photo) {
      setUploadStatus("Please select a photo.");
      return;
    }
    const newPhoto = {
      objectKey: URL.createObjectURL(photo),
      labels: customLabels ? customLabels.split(",") : [],
    };
    setResults((prev) => [...prev, newPhoto]);
    setUploadStatus("Photo uploaded successfully!");
    setPhoto(null);
    setCustomLabels("");
  };

  // Simulate search functionality
  const handleSearch = () => {
    if (!searchQuery) {
      setUploadStatus("Please enter a search query.");
      return;
    }
    const filteredResults = results.filter((photo) =>
      photo.labels.some((label) =>
        label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
    setResults(filteredResults);
    setSearchQuery("");
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
