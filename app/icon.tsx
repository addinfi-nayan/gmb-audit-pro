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
                    fontSize: 80,
                    background: "#0B1120",
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#06B6D4", // Cyan-500
                    fontWeight: 900,
                    borderRadius: "20%", // Rounded square
                    border: "8px solid #334155", // Slate-700 border
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
