let db = [];
fetch('passwords.json')
  .then(res => res.json())
  .then(json => { db = json; });

function doSearch() {
  const key = document.getElementById('searchInput').value.trim().toLowerCase();
  const resultDiv = document.getElementById('result');
  if (!key) {
    resultDiv.innerHTML = `<span style="color:#e85959;font-size:1.1em;">请输入关键词进行查询！</span>`;
    return;
  }
  // 按品牌/型号/类型模糊匹配
  const matched = db.filter(item =>
    item.brand.toLowerCase().includes(key) ||
    item.model.toLowerCase().includes(key) ||
    item.type.toLowerCase().includes(key)
  );
  if (!matched.length) {
    resultDiv.innerHTML = `<div style="text-align:center;color:#e85959;padding:1em 0;">
      <span style="font-size:1.2em;">&#128712; 未找到匹配的结果</span>
      <br>
      <span style="font-size:0.96em;color:#c6baba;">请尝试其他关键词。</span>
    </div>`;
    return;
  }
  // 按品牌分组，品牌名排序
  const grouped = {};
  matched.forEach(item => {
    const brand = item.brand;
    if (!grouped[brand]) grouped[brand] = [];
    grouped[brand].push(item);
  });
  let html = '';
  Object.keys(grouped).sort().forEach(brand => {
    html += `<div style="margin-bottom:1.1em;">
      <div style="color:#3178c6;font-weight:600;margin-bottom:0.2em;font-size:1.09em;">${brand}</div>
      <div style="overflow-x:auto;">
      <table class="result-table">
        <tr>
          <th>型号</th><th>类型</th><th>用户名</th><th>默认密码</th>
        </tr>`;
    grouped[brand].forEach(item => {
      html += `<tr>
        <td>${item.model}</td>
        <td>${item.type}</td>
        <td>${item.username}</td>
        <td>${item.password || '<span style="color:#bbb;">(空)</span>'}</td>
      </tr>`;
    });
    html += `</table></div></div>`;
  });
  resultDiv.innerHTML = html;
}

// 支持回车键查询
document.getElementById('searchInput').addEventListener('keydown', function(e) {
  if (e.key === 'Enter') doSearch();
});