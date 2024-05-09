window.onload = function () {
  const form = document.getElementById("sync-form");
  const fileInput = document.querySelector('input[type="file"]');
  const errorContainer = document.getElementById("error-container");
  const successMessage = document.getElementById("success-message");
  const offsetInput = document.querySelector('input[type="number"]');

  console.log("form and errorcontainer loaded");

  fileInput.addEventListener("change", () => {
    errorContainer.textContent = "";
    errorContainer.style.display = "none";
    successMessage.style.display = "none";
  });

  offsetInput.addEventListener("input", () => {
    errorContainer.textContent = "";
    errorContainer.style.display = "none";
    successMessage.style.display = "none";
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    errorContainer.textContent = "";
    errorContainer.style.display = "none";
    successMessage.style.display = "none";

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

        // Clear the input fields
        fileInput.value = "";
        offsetInput.value = "";

        // Show success message
        successMessage.style.display = "block";
        setTimeout(() => {
          successMessage.style.display = "none";
        }, 3000); // Hide the message after 3 seconds
      } else {
        // Handle error response
        const error = await response.json();
        errorContainer.style.display = "block";
        errorContainer.textContent = error.error;
      }
    } catch (error) {
      console.error("Error:", error);
    }
  });
};
