// src/utils/detectFaceFromS3.js

export const detectFaceFromS3 = async (bucket, key) => {
  try {
    // Replace with your actual API Gateway ID and stage
    const apiGatewayId = "r460f7jm4h"; // ✅ Replace this with yours
    const region = "ap-south-1";
    const stage = "dev"; // ✅ Replace with your stage name if different

    const url = `https://${apiGatewayId}.execute-api.${region}.amazonaws.com/${stage}?imageKey=${encodeURIComponent(key)}`;

    const response = await fetch(url, {
      method: "GET"
    });

    const data = await response.json();

    if (response.ok) {
      console.log("✅ Lambda responded:", data);
      return {
        success: true,
        faceMatched: data.faceMatched || false,
        message: data.message || "",
        matchedDetails: data.matchedDetails || null
      };
    } else {
      console.warn("⚠️ Lambda error response:", data);
      return {
        success: false,
        faceMatched: false,
        error: data.message || "Unexpected error from Lambda"
      };
    }
  } catch (error) {
    console.error("❌ Error calling Lambda API:", error);
    return {
      success: false,
      faceMatched: false,
      error: error.message
    };
  }
};
