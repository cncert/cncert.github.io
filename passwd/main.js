// 全局变量
let passwordDatabase = [];
let isDataLoaded = false;
let searchCache = new Map();

// DOM元素引用
const loadingIndicator = document.getElementById('loadingIndicator');
const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');

// 初始化应用
document.addEventListener('DOMContentLoaded', function() {
  initializeApp();
  setupEventListeners();
});

// 应用初始化
async function initializeApp() {
  try {
    showLoading(true);
    await loadPasswordDatabase();
    showLoading(false);
    isDataLoaded = true;
    
    // 显示欢迎信息
    showWelcomeMessage();
  } catch (error) {
    showLoading(false);
    showError('数据加载失败', '无法加载密码数据库，请检查网络连接或稍后重试。');
    console.error('Failed to load password database:', error);
  }
}

// 异步加载密码数据库
async function loadPasswordDatabase() {
  try {
    const response = await fetch('https://ntsoc.github.io/passwd/passwords.json');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!Array.isArray(data)) {
      throw new Error('Invalid data format: expected array');
    }
    
    passwordDatabase = data;
    console.log(`Loaded ${passwordDatabase.length} password entries`);
    
  } catch (error) {
    throw new Error(`Failed to load password database: ${error.message}`);
  }
}

// 设置事件监听器
function setupEventListeners() {
  // 搜索输入框事件
  searchInput.addEventListener('input', debounce(handleSearchInput, 300));
  searchInput.addEventListener('keydown', handleKeyDown);
  
  // 表单提交事件
  const searchForm = document.querySelector('.search-form');
  if (searchForm) {
    searchForm.addEventListener('submit', function(e) {
      e.preventDefault();
      doSearch();
    });
  }
}

// 处理搜索输入
function handleSearchInput(event) {
  const query = event.target.value.trim();
  
  if (query.length === 0) {
    showWelcomeMessage();
    return;
  }
  
  if (query.length >= 2) {
    doSearch(query);
  }
}

// 处理键盘事件
function handleKeyDown(event) {
  if (event.key === 'Enter') {
    event.preventDefault();
    doSearch();
  }
  
  if (event.key === 'Escape') {
    clearSearch();
  }
}

// 执行搜索
function doSearch(query = null) {
  if (!isDataLoaded) {
    showError('数据未加载', '密码数据库正在加载中，请稍候...');
    return;
  }
  
  const searchQuery = query || searchInput.value.trim().toLowerCase();
  
  if (!searchQuery) {
    showError('请输入搜索关键词', '请输入品牌、型号或设备类型进行搜索。');
    return;
  }
  
  // 检查缓存
  if (searchCache.has(searchQuery)) {
    const cachedResults = searchCache.get(searchQuery);
    displaySearchResults(cachedResults, searchQuery);
    return;
  }
  
  // 执行搜索
  const results = performSearch(searchQuery);
  
  // 缓存结果
  searchCache.set(searchQuery, results);
  
  // 显示结果
  displaySearchResults(results, searchQuery);
}

// 执行搜索逻辑
function performSearch(query) {
  const searchTerms = query.toLowerCase().split(/\s+/).filter(term => term.length > 0);
  
  return passwordDatabase.filter(item => {
    const searchableText = [
      item.brand || '',
      item.model || '',
      item.type || '',
      item.username || '',
      item.description || ''
    ].join(' ').toLowerCase();
    
    // 所有搜索词都必须匹配
    return searchTerms.every(term => searchableText.includes(term));
  });
}

// 显示搜索结果
function displaySearchResults(results, query) {
  if (results.length === 0) {
    showEmptyResults(query);
    return;
  }
  
  // 按品牌分组
  const groupedResults = groupResultsByBrand(results);
  
  // 生成HTML
  const html = generateResultsHTML(groupedResults, results.length);
  
  // 显示结果
  searchResults.innerHTML = html;
  
  // 添加动画效果
  searchResults.style.opacity = '0';
  searchResults.style.transform = 'translateY(20px)';
  
  requestAnimationFrame(() => {
    searchResults.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    searchResults.style.opacity = '1';
    searchResults.style.transform = 'translateY(0)';
  });
}

// 按品牌分组结果
function groupResultsByBrand(results) {
  const grouped = {};
  
  results.forEach(item => {
    const brand = item.brand || '未知品牌';
    if (!grouped[brand]) {
      grouped[brand] = [];
    }
    grouped[brand].push(item);
  });
  
  // 按品牌名排序
  const sortedBrands = Object.keys(grouped).sort((a, b) => {
    // 将"未知品牌"排在最后
    if (a === '未知品牌') return 1;
    if (b === '未知品牌') return -1;
    return a.localeCompare(b, 'zh-CN');
  });
  
  const sortedGrouped = {};
  sortedBrands.forEach(brand => {
    // 按型号排序
    grouped[brand].sort((a, b) => (a.model || '').localeCompare(b.model || '', 'zh-CN'));
    sortedGrouped[brand] = grouped[brand];
  });
  
  return sortedGrouped;
}

// 生成结果HTML
function generateResultsHTML(groupedResults, totalCount) {
  let html = `<div class="results-header">
    <h3>搜索结果 (${totalCount} 条)</h3>
  </div>`;
  
  // 定义弱色系颜色数组
  const weakColors = [
    '#ffe0b2', // Light Orange
    '#c8e6c9', // Light Green
    '#bbdefb', // Light Blue
    '#f8bbd0', // Light Pink
    '#e1bee7', // Light Purple
    '#d1c4e9', // Light Indigo
    '#b2ebf2', // Light Cyan
    '#ffccbc', // Light Deep Orange
    '#f0f4c3', // Light Lime
    '#cfd8dc'  // Blue Grey
  ];
  
  Object.entries(groupedResults).forEach(([brand, items]) => {
    html += `
      <div class="result-brand-group">
        <div class="result-brand-header">
          ${escapeHtml(brand)} (${items.length} 条)
        </div>
        <div class="result-tags-container">`;
    
    items.forEach(item => {
      // 为每个标签随机选择一个弱色
      const randomColor = weakColors[Math.floor(Math.random() * weakColors.length)];
      const displayText = `${item.model || '未知型号'} - ${item.username || 'admin'}/${item.password || '(空)'}`;
      html += `
        <div class="result-tag" style="background-color: ${randomColor};" title="型号: ${escapeHtml(item.model || '-')} | 类型: ${escapeHtml(item.type || '-')} | 用户名: ${escapeHtml(item.username || '-')} | 密码: ${escapeHtml(item.password || '(空)')} | 备注: ${escapeHtml(item.description || '-')}">
          ${escapeHtml(displayText)}
        </div>`;
    });
    
    html += `
        </div>
      </div>`;
  });
  
  return html;
}

// 显示欢迎信息
function showWelcomeMessage() {
  searchResults.innerHTML = `
    <div class="welcome-message">
      <div class="welcome-icon">🔍</div>
      <h3 class="welcome-title">欢迎使用默认密码查询系统</h3>
      <p class="welcome-description">
        输入设备品牌、型号或类型开始搜索。支持模糊匹配，例如：
      </p>
      <div class="welcome-examples">
        <span class="example-tag">TP-Link</span>
        <span class="example-tag">WR841N</span>
        <span class="example-tag">路由器</span>
        <span class="example-tag">华为</span>
      </div>
      <p class="welcome-note">
        💡 提示：搜索不区分大小写，支持多个关键词组合搜索
      </p>
    </div>`;
}

// 显示空结果
function showEmptyResults(query) {
  searchResults.innerHTML = `
    <div class="empty-message">
      <div class="empty-icon">📭</div>
      <h3 class="empty-title">未找到匹配结果</h3>
      <p class="empty-description">
        没有找到与 "<strong>${escapeHtml(query)}</strong>" 相关的密码信息
      </p>
      <div class="empty-suggestions">
        <p>建议您：</p>
        <ul>
          <li>检查关键词拼写是否正确</li>
          <li>尝试使用更通用的关键词</li>
          <li>使用品牌名或设备类型搜索</li>
          <li>尝试英文或中文关键词</li>
        </ul>
      </div>
    </div>`;
}

// 显示错误信息
function showError(title, message) {
  searchResults.innerHTML = `
    <div class="error-message">
      <div class="error-icon">⚠️</div>
      <h3 class="error-title">${escapeHtml(title)}</h3>
      <p class="error-description">${escapeHtml(message)}</p>
    </div>`;
}

// 显示/隐藏加载指示器
function showLoading(show) {
  if (show) {
    loadingIndicator.classList.add('show');
  } else {
    loadingIndicator.classList.remove('show');
  }
}

// 清空搜索
function clearSearch() {
  searchInput.value = '';
  showWelcomeMessage();
}

// 搜索建议功能
function searchSuggestion(keyword) {
  searchInput.value = keyword;
  searchInput.focus();
  doSearch(keyword);
}

// 防抖函数
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// HTML转义函数
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return String(text).replace(/[&<>"']/g, function(m) { return map[m]; });
}

// 性能监控
function logPerformance(operation, startTime) {
  const endTime = performance.now();
  const duration = endTime - startTime;
  console.log(`${operation} took ${duration.toFixed(2)} milliseconds`);
}

// 错误处理
window.addEventListener('error', function(event) {
  console.error('JavaScript error:', event.error);
  showError('系统错误', '页面运行时发生错误，请刷新页面重试。');
});

// 网络状态监控
window.addEventListener('online', function() {
  if (!isDataLoaded) {
    initializeApp();
  }
});

window.addEventListener('offline', function() {
  showError('网络连接断开', '请检查网络连接后重试。');
});

// 导出函数供HTML调用
window.doSearch = doSearch;
window.searchSuggestion = searchSuggestion;

