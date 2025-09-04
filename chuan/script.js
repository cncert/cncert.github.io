document.addEventListener("DOMContentLoaded", () => {
    const studentNameInput = document.getElementById("studentNameInput");
    const searchButton = document.getElementById("searchButton");
    const searchResultsDiv = document.getElementById("searchResults");
    let studentsData = [];

    // 低亮度可爱颜色数组
    const cuteColors = [
        '#FFD1DC', '#FFABAB', '#FFC3A0', '#FF677D', '#D4A5A5', '#A0CED9', '#B2EBF2', '#C8F2EE',
        '#D9F2D9', '#E6FFD9', '#FFFFB2', '#FFE0B2', '#FFCCBC', '#D7BDE2', '#A9CCE3', '#7FB3D5',
        '#A2D9CE', '#A9DFBF', '#F9E79F', '#FAD7A0', '#E5B4B4', '#F0F8FF', '#F5F5DC', '#FDF5E6'
    ];

    // 随机获取一个颜色
    const getRandomColor = () => {
        const randomIndex = Math.floor(Math.random() * cuteColors.length);
        return cuteColors[randomIndex];
    };

    // 加载学生数据
    fetch("students.json")
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            studentsData = data;
            console.log("学生数据加载成功:", studentsData);
        })
        .catch(error => {
            console.error("加载学生数据失败:", error);
            searchResultsDiv.innerHTML = "<p class=\"error-message\">加载学生数据失败，请稍后再试。</p>";
        });

    // 查询功能
    const performSearch = () => {
        const searchTerm = studentNameInput.value.trim();
        searchResultsDiv.innerHTML = ""; // 清空之前的查询结果

        if (searchTerm === "") {
            searchResultsDiv.innerHTML = "<p class=\"error-message\">请输入学生姓名进行查询。</p>";
            return;
        }

        const foundStudents = studentsData.filter(student => student["姓名"] === searchTerm);

        if (foundStudents.length > 0) {
            foundStudents.forEach(student => {
                const fields = [
                    { label: "姓名", value: student["姓名"] },
                    { label: "学号", value: student["学号"] },
                    { label: "值日时间", value: student["值日时间"] },
                    { label: "值日任务", value: student["值日任务"] }
                ];

                fields.forEach(field => {
                    const studentTag = document.createElement("div");
                    studentTag.classList.add("student-tag");
                    studentTag.style.backgroundColor = getRandomColor(); // 设置随机背景色
                    studentTag.innerHTML = `<strong>${field.label}:</strong> ${field.value}`;
                    searchResultsDiv.appendChild(studentTag);
                });
            });
        } else {
            searchResultsDiv.innerHTML = "<p class=\"error-message\">未找到该学生的信息，请检查姓名是否正确。</p>";
        }
    };

    searchButton.addEventListener("click", performSearch);

    studentNameInput.addEventListener("keypress", (event) => {
        if (event.key === "Enter") {
            performSearch();
        }
    });
});


