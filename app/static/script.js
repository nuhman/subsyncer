window.onload = function () {
  const form = document.getElementById("sync-form");
  const errorContainer = document.getElementById("error-container");

  console.log("form and errorcontainer loaded");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(form);

    try {
      const response = await fetch("/", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        // Handle successful response (file download)
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "synced_subtitles.srt";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } else {
        // Handle error response
        const error = await response.json();
        errorContainer.textContent = error.error;
      }
    } catch (error) {
      console.error("Error:", error);
    }
  });
};
