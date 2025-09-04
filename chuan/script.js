document.addEventListener("DOMContentLoaded", () => {
    const studentNameInput = document.getElementById("studentNameInput");
    const searchButton = document.getElementById("searchButton");
    const searchResultsDiv = document.getElementById("searchResults");
    const scheduleResultsDiv = document.getElementById("scheduleResults");
    const showScheduleToggle = document.getElementById("showScheduleToggle");
    
    let studentsData = [];
    let scheduleData = [];
    let currentWeek = "单周";

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

    // 加载课程表数据
    fetch("course_schedule.json")
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            scheduleData = data;
            console.log("课程表数据加载成功:", scheduleData);
        })
        .catch(error => {
            console.error("加载课程表数据失败:", error);
        });

    // 显示/隐藏课程表
    showScheduleToggle.addEventListener("change", () => {
        if (showScheduleToggle.checked) {
            scheduleResultsDiv.style.display = "block";
            displaySchedule();
        } else {
            scheduleResultsDiv.style.display = "none";
        }
    });

    // 显示课程表
    const displaySchedule = () => {
        if (scheduleData.length === 0) {
            scheduleResultsDiv.innerHTML = "<p class=\"error-message\">课程表数据未加载。</p>";
            return;
        }

        // 创建单双周切换按钮
        const weekToggleHTML = `
            <div class="week-toggle">
                <button id="singleWeekBtn" class="${currentWeek === '单周' ? 'active' : ''}">单周</button>
                <button id="doubleWeekBtn" class="${currentWeek === '双周' ? 'active' : ''}">双周</button>
            </div>
        `;

        // 过滤当前周的数据
        const currentWeekData = scheduleData.filter(item => item.单双周 === currentWeek);
        
        // 创建课程表
        const weekdays = ["星期一", "星期二", "星期三", "星期四", "星期五"];
        const periods = ["第一节", "第二节", "第三节", "第四节", "第五节", "第六节", "第七节", "第八节"];
        
        let tableHTML = `
            <table class="schedule-table">
                <thead>
                    <tr>
                        <th>节次/星期</th>
                        ${weekdays.map(day => `<th>${day}</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
        `;

        periods.forEach(period => {
            tableHTML += `<tr><td><strong>${period}</strong></td>`;
            weekdays.forEach(day => {
                const courseItem = currentWeekData.find(item => 
                    item.星期 === day && item.节次 === period
                );
                const course = courseItem ? courseItem.课程 : "-";
                tableHTML += `<td>${course}</td>`;
            });
            tableHTML += `</tr>`;
        });

        tableHTML += `
                </tbody>
            </table>
        `;

        scheduleResultsDiv.innerHTML = weekToggleHTML + tableHTML;

        // 添加周切换事件监听器
        document.getElementById("singleWeekBtn").addEventListener("click", () => {
            currentWeek = "单周";
            displaySchedule();
        });

        document.getElementById("doubleWeekBtn").addEventListener("click", () => {
            currentWeek = "双周";
            displaySchedule();
        });
    };

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

