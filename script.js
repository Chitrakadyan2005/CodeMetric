document.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => {
      document.querySelector(".splash").style.display = "none";
      document.querySelector(".content").style.display = "block";
    }, 3000); // after animation ends
  });

document.addEventListener("DOMContentLoaded", () => {
    const messages = [
        "Welcome to CodeStats!",
        "Track. Improve. Succeed.",
        "Your coding journey starts here.",
        "Unlock your potential with every submission.",
        "Coding Progress Dashboard",
        "One step closer to your dream job"
    ];

    const splashText = document.querySelector(".splash h1");
    splashText.textContent = messages[Math.floor(Math.random() * messages.length)];

    setTimeout(() => {
        document.querySelector(".splash").style.display = "none";
        document.querySelector(".content").style.display = "block";
    }, 3000);
});


document.addEventListener("DOMContentLoaded", function () {
    const searchButton = document.querySelector(".search-btn");
    const usernameInput = document.getElementById("user-input");
    const statsContainer = document.querySelector(".stats-container");
    const easyProgressCircle = document.querySelector(".easy-progress");
    const mediumProgressCircle = document.querySelector(".medium-progress");
    const hardProgressCircle = document.querySelector(".hard-progress");
    const easyLabel = document.getElementById("easy-label");
    const mediumLabel = document.getElementById("medium-label");
    const hardLabel = document.getElementById("hard-label");
    const cardStatsContainer = document.querySelector(".stats-cards");

    // Validate Username
    function validateUsername(username) {
        if (username.trim() === "") {
            alert("Username should not be empty");
            return false;
        }
        const regex = /^[a-zA-Z0-9_-]{1,15}$/;
        const isMatching = regex.test(username);
        if (!isMatching) {
            alert("Invalid Username");
        }
        return isMatching;
    }

    // Fetch User Details from API
    async function fetchUserDetails(username) {
        try {
            searchButton.textContent = "Searching...";
            searchButton.disabled = true;

            const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
            const targetUrl = 'https://leetcode.com/graphql/';

            const myHeaders = new Headers();
            myHeaders.append("content-type", "application/json");

            const graphql = JSON.stringify({
                query: `
                    query userSessionProgress($username: String!) {
                        allQuestionsCount {
                            difficulty
                            count
                        }
                        matchedUser(username: $username) {
                            submitStats {
                                acSubmissionNum {
                                    difficulty
                                    count
                                    submissions
                                }
                                totalSubmissionNum {
                                    difficulty
                                    count
                                    submissions
                                }
                            }
                        }
                    }`,
                variables: { "username": username }
            });

            const requestOptions = {
                method: "POST",
                headers: myHeaders,
                body: graphql,
            };

            const response = await fetch(proxyUrl + targetUrl, requestOptions);
            if (!response.ok) {
                throw new Error("Unable to fetch the User details");
            }
            const parsedData = await response.json();
            console.log("User Data:", parsedData);

            displayUserData(parsedData);
        } catch (error) {
            statsContainer.innerHTML = `<p>${error.message}</p>`;
        } finally {
            searchButton.textContent = "Search";
            searchButton.disabled = false;
        }
    }

    // Update Progress on Circles
    function updateProgress(solved, total, label, circle) {
        const progressDegree = (solved / total) * 100;
        circle.style.setProperty("--progress-degree", `${progressDegree}%`);
        label.textContent = `${solved}/${total}`;
    }

    // Display User Data
    function displayUserData(parsedData, username) {
        const totalQues = parsedData.data.allQuestionsCount[0].count;
        const totalEasyQues = parsedData.data.allQuestionsCount[1].count;
        const totalMediumQues = parsedData.data.allQuestionsCount[2].count;
        const totalHardQues = parsedData.data.allQuestionsCount[3].count;

        const solvedTotalQues = parsedData.data.matchedUser.submitStats.acSubmissionNum[0].count;
        const solvedTotalEasyQues = parsedData.data.matchedUser.submitStats.acSubmissionNum[1].count;
        const solvedTotalMediumQues = parsedData.data.matchedUser.submitStats.acSubmissionNum[2].count;
        const solvedTotalHardQues = parsedData.data.matchedUser.submitStats.acSubmissionNum[3].count;

        updateProgress(solvedTotalEasyQues, totalEasyQues, easyLabel, easyProgressCircle);
        updateProgress(solvedTotalMediumQues, totalMediumQues, mediumLabel, mediumProgressCircle);
        updateProgress(solvedTotalHardQues, totalHardQues, hardLabel, hardProgressCircle);

        const cardsData = [
            { label: "Overall Submissions", value: parsedData.data.matchedUser.submitStats.acSubmissionNum[0].submissions },
            { label: "Overall Easy Submissions", value: parsedData.data.matchedUser.submitStats.acSubmissionNum[1].submissions },
            { label: "Overall Medium Submissions", value: parsedData.data.matchedUser.submitStats.acSubmissionNum[2].submissions },
            { label: "Overall Hard Submissions", value: parsedData.data.matchedUser.submitStats.acSubmissionNum[3].submissions },
        ];

        console.log("Card Data:", cardsData);

        cardStatsContainer.innerHTML = cardsData.map(
            data =>
                `<div class="card">
                    <h4>${data.label}</h4>
                    <p>${data.value}</p>
                </div>`
        ).join("");

                // Save Current Data to localStorage for Weekly/Monthly Tracking
                const today = new Date().toISOString().split("T")[0];
                const historyKey = `progress_${username}`;
                const history = JSON.parse(localStorage.getItem(historyKey)) || {};
                history[today] = {
                    easy: solvedTotalEasyQues,
                    medium: solvedTotalMediumQues,
                    hard: solvedTotalHardQues,
                    total: solvedTotalQues
                };
                localStorage.setItem(historyKey, JSON.stringify(history));
        
                // Strength & Weakness Detection
                const totalSolved = solvedTotalEasyQues + solvedTotalMediumQues + solvedTotalHardQues;
                const strengthMsg = () => {
                    const easyPerc = (solvedTotalEasyQues / totalSolved) * 100;
                    const medPerc = (solvedTotalMediumQues / totalSolved) * 100;
                    const hardPerc = (solvedTotalHardQues / totalSolved) * 100;
                    if (easyPerc > 50) return "You're strong in Easy problems!";
                    if (medPerc > 50) return "Medium-level is your strength.";
                    if (hardPerc > 30) return "Great! You're doing well in Hard problems.";
                    return "Balanced problem-solving approach!";
                };
        
                // Dynamic Recommendation based on Weak Area
                const recommendMsg = () => {
                    if (solvedTotalMediumQues < solvedTotalEasyQues * 0.6)
                        return "Try solving more Medium questions for better prep.";
                    if (solvedTotalHardQues < 5)
                        return "Start attempting Hard problems once a week.";
                    return "Keep up the consistent performance!";
                };
        
                const analysisContainer = document.createElement("div");
                analysisContainer.classList.add("analysis");
                analysisContainer.innerHTML = `
                    <h3>🧠 Insights & Recommendations</h3>
                    <p><strong>Strength:</strong> ${strengthMsg()}</p>
                    <p><strong>Tip:</strong> ${recommendMsg()}</p>
                `;
                statsContainer.appendChild(analysisContainer);
        
    }

    // Event Listener for Search Button
    if (searchButton) {
        searchButton.addEventListener('click', function () {
            const username = usernameInput.value.trim();
            if (validateUsername(username)) {
                fetchUserDetails(username);
            }
        });
    } else {
        console.error("Search button not found!");
    }
});
