import { Shape } from "@/types";

export const downloadAsPNG = ({ canvasRef, state }) => {
  if (canvasRef.current) {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", "800");
    svg.setAttribute("height", "600");

    state.shapes.forEach((shape: Shape) => {
      const element = document.createElementNS(
        "http://www.w3.org/2000/svg",
        shape.type === "rectangle" ? "rect" : "circle"
      );

      if (shape.type === "rectangle") {
        element.setAttribute("x", shape.x.toString());
        element.setAttribute("y", shape.y.toString());
        element.setAttribute("width", shape.width.toString());
        element.setAttribute("height", shape.height.toString());
      } else {
        element.setAttribute("cx", (shape.x + shape.width / 2).toString());
        element.setAttribute("cy", (shape.y + shape.height / 2).toString());
        element.setAttribute("r", (shape.width / 2).toString());
      }

      element.setAttribute("fill", "#4f46e5");
      svg.appendChild(element);
    });

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext("2d");

    if (ctx) {
      const img = new Image();
      img.src = "data:image/svg+xml;base64," + btoa(svgData);

      img.onload = () => {
        ctx.drawImage(img, 0, 0);
        const link = document.createElement("a");
        link.download = "design.png";
        link.href = canvas.toDataURL("image/png");
        link.click();
      };
    }
  }
};
