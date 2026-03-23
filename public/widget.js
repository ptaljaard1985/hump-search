(function () {
  // Find our own script tag and insert the widget before it
  var scriptEl = document.querySelector('script[src*="widget.js"]');
  if (!scriptEl) return;

  var API_URL = new URL(scriptEl.src).origin;

  // Create container
  var container = document.createElement("div");
  scriptEl.parentNode.insertBefore(container, scriptEl);

  // Styles
  var style = document.createElement("style");
  style.textContent =
    ".hum-w{font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;max-width:700px;margin:0 auto}" +
    ".hum-w *{box-sizing:border-box}" +
    ".hum-sb{display:flex;gap:8px;margin-bottom:24px}" +
    ".hum-si{flex:1;padding:12px 16px;border:1px solid #e0e0e0;border-radius:8px;font-size:14px;outline:none}" +
    ".hum-si:focus{border-color:#333}" +
    ".hum-bt{padding:12px 24px;background:#1a1a1a;color:#fff;border:none;border-radius:8px;font-size:14px;cursor:pointer;white-space:nowrap}" +
    ".hum-bt:hover{background:#333}" +
    ".hum-bt:disabled{opacity:0.5;cursor:not-allowed}" +
    ".hum-rc{border:1px solid #eee;border-radius:8px;padding:16px;margin-bottom:12px}" +
    ".hum-rt{font-size:16px;font-weight:600;margin:0 0 4px}" +
    ".hum-rt a{color:#1a56db;text-decoration:none}" +
    ".hum-rt a:hover{text-decoration:underline}" +
    ".hum-ry{display:inline-block;font-size:11px;background:#f3f4f6;color:#666;padding:2px 8px;border-radius:12px;margin-bottom:8px}" +
    ".hum-rd{font-size:14px;color:#444;line-height:1.5;margin:0}" +
    ".hum-ld{font-size:14px;color:#888}";
  document.head.appendChild(style);

  // Build UI
  container.className = "hum-w";

  var box = document.createElement("div");
  box.className = "hum-sb";

  var input = document.createElement("input");
  input.type = "text";
  input.className = "hum-si";
  input.placeholder = "Describe what you need, e.g. my client is nervous about market volatility...";

  var btn = document.createElement("button");
  btn.className = "hum-bt";
  btn.textContent = "Search";

  box.appendChild(input);
  box.appendChild(btn);
  container.appendChild(box);

  var results = document.createElement("div");
  container.appendChild(results);

  function esc(s) {
    var d = document.createElement("div");
    d.appendChild(document.createTextNode(s));
    return d.innerHTML;
  }

  function search() {
    var q = input.value.trim();
    if (!q) return;
    btn.disabled = true;
    btn.textContent = "Searching...";
    results.innerHTML = '<div class="hum-ld">Finding the best content for your situation...</div>';

    fetch(API_URL + "/api/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: q })
    })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        var md = data.recommendation || "";
        var parts = md.split(/^---$/m);
        var html = "";
        for (var i = 0; i < parts.length; i++) {
          var s = parts[i].trim();
          if (!s) continue;
          var tm = s.match(/###\s*\[([^\]]+)\]\(([^)]+)\)/);
          if (!tm) continue;
          var tp = s.match(/\*([^*]+)\*/);
          var lines = s.split("\n");
          var desc = [];
          var past = false;
          for (var j = 0; j < lines.length; j++) {
            var l = lines[j].trim();
            if (!l || l.indexOf("###") === 0) continue;
            if (/^\*[^*]+\*$/.test(l) && !past) { past = true; continue; }
            if (past) desc.push(l);
          }
          html += '<div class="hum-rc">' +
            '<p class="hum-rt"><a href="' + esc(tm[2]) + '" target="_blank">' + esc(tm[1]) + '</a></p>' +
            '<span class="hum-ry">' + esc(tp ? tp[1] : "") + '</span>' +
            '<p class="hum-rd">' + esc(desc.join(" ")) + '</p></div>';
        }
        results.innerHTML = html || '<div class="hum-ld">No strong matches found. Try describing your situation differently.</div>';
      })
      .catch(function () {
        results.innerHTML = '<div class="hum-ld">Sorry, something went wrong. Please try again.</div>';
      })
      .finally(function () {
        btn.disabled = false;
        btn.textContent = "Search";
      });
  }

  btn.addEventListener("click", search);
  input.addEventListener("keydown", function (e) {
    if (e.key === "Enter") search();
  });
})();
