document.addEventListener("DOMContentLoaded", function () {
  const searchbutton = document.getElementById("search-btn");
  const userinput = document.getElementById("username");
  const statscontainer = document.querySelector(".stats-container");
  const easyprogress = document.querySelector(".easy-problem");
  const mediumprogress = document.querySelector(".medium-problem");
  const hardprogress = document.querySelector(".hard-problem");
  const easylabel = document.getElementById("easy-label");
  const mediumlabel = document.getElementById("medium-label");
  const hardlabel = document.getElementById("hard-label");
  const statcardcontainer = document.querySelector(".stats-card");

  function validation(username) {
    if (username.trim() === "") {
      alert("Username should not be empty");
      return false;
    }

    const regex = /^[a-zA-Z0-9_-]{1,15}$/;
    if (!regex.test(username)) {
      alert("Invalid Username");
      return false;
    }
    return true;
  }

  async function fetchUserDetails(username) {
    try {
      const proxyUrl = "https://cors-anywhere.herokuapp.com/";
      const targetUrl = "https://leetcode.com/graphql/";

      const myHeaders = new Headers();
      myHeaders.append("content-type", "application/json");

      const graphql = JSON.stringify({
        query:
          "\n    query userSessionProgress($username: String!) {\n  allQuestionsCount {\n    difficulty\n    count\n  }\n  matchedUser(username: $username) {\n    submitStats {\n      acSubmissionNum {\n        difficulty\n        count\n        submissions\n      }\n      totalSubmissionNum {\n        difficulty\n        count\n        submissions\n      }\n    }\n  }\n}\n    ",
        variables: { username: `${username}` },
      });
      const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: graphql,
      };

      const response = await fetch(proxyUrl + targetUrl, requestOptions);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const parsedData = await response.json();
      console.log("Fetched data:", parsedData);
      displayUserData(parsedData);
    } catch (error) {
      console.error("Fetch Error:", error);
      statscontainer.innerHTML = `<p>${error.message}</p>`;
    } finally {
      searchbutton.textContent = "Search";
      searchbutton.disabled = false;
    }
  }

  function updateProgress(solved, total, label, circle) {
    const progressDegree = (solved / total) * 100;
    circle.style.setProperty("--progress-degree", `${progressDegree}%`);
    label.textContent = `${solved}/${total}`;
  }

  function displayUserData(parsedData) {

    if (!parsedData || !parsedData.data.matchedUser) {
        console.error("Error: matchedUser is undefined or null");
        statscontainer.innerHTML = "<p>User not found or invalid response.</p>";
        return;
    }

    const userStats = parsedData.data.matchedUser.submitStats.acSubmissionNum;
    const totalQuestions = parsedData.data.allQuestionsCount;

    const Teasyq = totalQuestions.find((q) => q.difficulty === "Easy").count;
    const Tmediumq = totalQuestions.find(
      (q) => q.difficulty === "Medium"
    ).count;
    const Thardq = totalQuestions.find((q) => q.difficulty === "Hard").count;

    const easySolved = userStats.find((q) => q.difficulty === "Easy").count;
    const mediumSolved = userStats.find((q) => q.difficulty === "Medium").count;
    const hardSolved = userStats.find((q) => q.difficulty === "Hard").count;

    updateProgress(easySolved, Teasyq, easylabel, easyprogress);
    updateProgress(mediumSolved, Tmediumq, mediumlabel, mediumprogress);
    updateProgress(hardSolved, Thardq, hardlabel, hardprogress);

    const cardData = [
      {
        label: "Overall submission",
        value:
          parsedData.data.matchedUser.submitStats.totalSubmissionNum[0]
            .submissions,
      },
      {
        label: "Overall Easy submission",
        value:
          parsedData.data.matchedUser.submitStats.totalSubmissionNum[1]
            .submissions,
      },
      {
        label: "Overall Hard submission",
        value:
          parsedData.data.matchedUser.submitStats.totalSubmissionNum[2]
            .submissions,
      },
      {
        label: "Overall submission",
        value:
          parsedData.data.matchedUser.submitStats.totalSubmissionNum[3]
            .submissions,
      },
    ];

    console.log("Card Output",cardData);

    statcardcontainer.innerHTML = cardData.map(
        data => 
             `
            <div class = "card ">
            <h3>${data.label}</h3>
            <p>${data.value}</p>
            </div>`
        
    ).join("")
  }

  searchbutton.addEventListener("click", function () {
    const username = userinput.value;
    if (validation(username)) {
      fetchUserDetails(username);
    }
  });
});
