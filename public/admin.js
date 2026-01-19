document.getElementById('uploadBtn').addEventListener('click', async () => {
    const fileInput = document.getElementById('tsvFile');
    const statusDiv = document.getElementById('statusMessage');
    const btn = document.getElementById('uploadBtn');

    if (fileInput.files.length === 0) {
        statusDiv.textContent = "Please select a file first.";
        statusDiv.style.color = "red";
        return;
    }

    const file = fileInput.files[0];
    const formData = new FormData();
    formData.append('file', file);

    // Visual feedback
    btn.disabled = true;
    btn.textContent = "Uploading...";
    statusDiv.textContent = "";

    try {
        const response = await fetch('/api/calendar/bulk', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (response.ok) {
            statusDiv.textContent = `Success! ${result.message} (${result.count} rows).`;
            statusDiv.style.color = "var(--accent-green)";
            setTimeout(() => {
                alert("Calendar updated successfully! Redirecting to calendar...");
                window.location.href = "runs.html";
            }, 1000);
        } else {
            throw new Error(result.error || "Upload failed");
        }

    } catch (error) {
        console.error("Upload Error:", error);
        statusDiv.textContent = `Error: ${error.message}`;
        statusDiv.style.color = "red";
        btn.disabled = false;
        btn.textContent = "Update Calendar";
    }
});
