const links = document.querySelectorAll("[data-view-link]");
const views = document.querySelectorAll(".view");

function showView(viewName) {
  views.forEach((view) => {
    view.classList.toggle("active", view.id === viewName);
  });

  links.forEach((link) => {
    link.classList.toggle("active", link.dataset.viewLink === viewName);
  });
}

links.forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    const viewName = link.dataset.viewLink;
    history.replaceState(null, "", `#${viewName}`);
    showView(viewName);
  });
});

const initialView = location.hash.replace("#", "") || "dashboard";
showView(document.getElementById(initialView) ? initialView : "dashboard");
