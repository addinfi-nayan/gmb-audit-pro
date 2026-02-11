import { ImageResponse } from "next/og";

// Image metadata
export const size = {
    width: 192,
    height: 192,
};
export const contentType = "image/png";

// Image generation
export default function Icon() {
    return new ImageResponse(
        (
            // ImageResponse JSX element
            <div
                style={{
                    fontSize: 100, // Increased font size
                    background: "transparent", // Transparent background
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#06B6D4", // Cyan-500
                    fontWeight: 900,
                    // Removed border and borderRadius
                }}
            >
                GMB
            </div>
        ),
        // ImageResponse options
        {
            ...size,
        }
    );
}
