document.addEventListener('DOMContentLoaded', () => {
    const studentNameInput = document.getElementById('studentNameInput');
    const searchButton = document.getElementById('searchButton');
    const searchResultsDiv = document.getElementById('searchResults');
    let studentsData = [];

    // 加载学生数据
    fetch('./students.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            studentsData = data;
            console.log('学生数据加载成功:', studentsData);
        })
        .catch(error => {
            console.error('加载学生数据失败:', error);
            searchResultsDiv.innerHTML = '<p class="error-message">加载学生数据失败，请稍后再试。</p>';
        });

    // 查询功能
    const performSearch = () => {
        const searchTerm = studentNameInput.value.trim();
        searchResultsDiv.innerHTML = ''; // 清空之前的查询结果

        if (searchTerm === '') {
            searchResultsDiv.innerHTML = '<p class="error-message">请输入学生姓名进行查询。</p>';
            return;
        }

        const foundStudents = studentsData.filter(student => student['姓名'] === searchTerm);

        if (foundStudents.length > 0) {
            foundStudents.forEach(student => {
                const studentCard = document.createElement('div');
                studentCard.classList.add('student-card');
                studentCard.innerHTML = `
                    <p><strong>姓名:</strong> ${student['姓名']}</p>
                    <p><strong>学号:</strong> ${student['学号']}</p>
                    <p><strong>值日时间:</strong> ${student['值日时间']}</p>
                    <p><strong>值日任务:</strong> ${student['值日任务']}</p>
                `;
                searchResultsDiv.appendChild(studentCard);
            });
        } else {
            searchResultsDiv.innerHTML = '<p class="error-message">未找到该学生的信息，请检查姓名是否正确。</p>';
        }
    };

    searchButton.addEventListener('click', performSearch);

    studentNameInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            performSearch();
        }
    });
});


