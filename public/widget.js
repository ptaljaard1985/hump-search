(function () {
  // ============================================================
  // HUM Content Search Widget
  // Embed on any page with:
  //   <div id="hum-search"></div>
  //   <script src="https://YOUR-APP.vercel.app/widget.js"></script>
  // ============================================================

  var API_URL = (function () {
    var scripts = document.getElementsByTagName("script");
    var src = scripts[scripts.length - 1].src;
    var url = new URL(src);
    return url.origin;
  })();

  var container = document.getElementById("hum-search");
  if (!container) return;

  // Styles
  var style = document.createElement("style");
  style.textContent = [
    "#hum-search { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 700px; margin: 0 auto; }",
    "#hum-search * { box-sizing: border-box; }",
    ".hum-search-box { display: flex; gap: 8px; margin-bottom: 24px; }",
    ".hum-search-input { flex: 1; padding: 12px 16px; border: 1px solid #e0e0e0; border-radius: 8px; font-size: 14px; outline: none; transition: border-color 0.2s; }",
    ".hum-search-input:focus { border-color: #333; }",
    ".hum-search-input::placeholder { color: #999; }",
    ".hum-search-btn { padding: 12px 24px; background: #1a1a1a; color: #fff; border: none; border-radius: 8px; font-size: 14px; cursor: pointer; white-space: nowrap; transition: background 0.2s; }",
    ".hum-search-btn:hover { background: #333; }",
    ".hum-search-btn:disabled { opacity: 0.5; cursor: not-allowed; }",
    ".hum-search-loading { font-size: 14px; color: #888; }",
    ".hum-search-results { }",
    ".hum-result-card { border: 1px solid #eee; border-radius: 8px; padding: 16px; margin-bottom: 12px; }",
    ".hum-result-title { font-size: 16px; font-weight: 600; margin: 0 0 4px 0; }",
    ".hum-result-title a { color: #1a56db; text-decoration: none; }",
    ".hum-result-title a:hover { text-decoration: underline; }",
    ".hum-result-type { display: inline-block; font-size: 11px; background: #f3f4f6; color: #666; padding: 2px 8px; border-radius: 12px; margin-bottom: 8px; }",
    ".hum-result-desc { font-size: 14px; color: #444; line-height: 1.5; margin: 0; }",
    ".hum-no-match { font-size: 14px; color: #444; line-height: 1.6; }",
  ].join("\n");
  document.head.appendChild(style);

  // HTML
  container.innerHTML = [
    '<div class="hum-search-box">',
    '  <input class="hum-search-input" type="text" placeholder="Describe what you need, e.g. my client is nervous about market volatility..." />',
    '  <button class="hum-search-btn">Search</button>',
    "</div>",
    '<div class="hum-search-results"></div>',
  ].join("");

  var input = container.querySelector(".hum-search-input");
  var btn = container.querySelector(".hum-search-btn");
  var results = container.querySelector(".hum-search-results");

  // Type label mapping
  var typeLabels = {
    article: "Article",
    "advisor-doc": "Adviser Document",
    infographic: "Infographic",
    "pdf-guide": "PDF Guide",
    video: "Video",
    "email-sequence": "Email Sequence",
  };

  function parseMarkdown(md) {
    // Parse the structured markdown response into result cards
    var sections = md.split(/^---$/m).filter(function (s) {
      return s.trim();
    });

    var cards = [];

    sections.forEach(function (section) {
      // Extract title and URL from ### [Title](URL)
      var titleMatch = section.match(
        /###\s*\[([^\]]+)\]\(([^)]+)\)/
      );
      // Extract type from *Type*
      var typeMatch = section.match(/\*([^*]+)\*/);
      // Extract description — everything after the type line
      var lines = section.trim().split("\n");
      var descLines = [];
      var pastType = false;
      lines.forEach(function (line) {
        var trimmed = line.trim();
        if (!trimmed) return;
        if (trimmed.match(/^###/)) return;
        if (trimmed.match(/^\*[^*]+\*$/) && !pastType) {
          pastType = true;
          return;
        }
        if (pastType) {
          descLines.push(trimmed);
        }
      });

      if (titleMatch) {
        cards.push({
          title: titleMatch[1],
          url: titleMatch[2],
          type: typeMatch ? typeMatch[1] : "",
          desc: descLines.join(" "),
        });
      }
    });

    return cards;
  }

  function renderCards(cards) {
    if (cards.length === 0) {
      return '<div class="hum-no-match">No strong matches found. Try describing your situation differently, or browse the content library directly.</div>';
    }

    return cards
      .map(function (card) {
        var typeLabel =
          typeLabels[card.type] || typeLabels[card.type.toLowerCase()] || card.type;
        return [
          '<div class="hum-result-card">',
          '  <p class="hum-result-title"><a href="' + escapeHtml(card.url) + '" target="_blank">' + escapeHtml(card.title) + "</a></p>",
          '  <span class="hum-result-type">' + escapeHtml(typeLabel) + "</span>",
          '  <p class="hum-result-desc">' + escapeHtml(card.desc) + "</p>",
          "</div>",
        ].join("");
      })
      .join("");
  }

  function escapeHtml(str) {
    var div = document.createElement("div");
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  function doSearch() {
    var query = input.value.trim();
    if (!query) return;

    btn.disabled = true;
    btn.textContent = "Searching...";
    results.innerHTML = '<div class="hum-search-loading">Finding the best content for your situation...</div>';

    fetch(API_URL + "/api/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: query }),
    })
      .then(function (res) {
        return res.json();
      })
      .then(function (data) {
        var cards = parseMarkdown(data.recommendation || "");
        results.innerHTML = renderCards(cards);
      })
      .catch(function () {
        results.innerHTML =
          '<div class="hum-no-match">Sorry, something went wrong. Please try again.</div>';
      })
      .finally(function () {
        btn.disabled = false;
        btn.textContent = "Search";
      });
  }

  btn.addEventListener("click", doSearch);
  input.addEventListener("keydown", function (e) {
    if (e.key === "Enter") doSearch();
  });
})();
