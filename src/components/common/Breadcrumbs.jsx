import { Link } from "react-router-dom";
import "../../styles/seo-extras.css";

// items: [{ name, path }] from the home page down to the current page. The
// last item is the page you're on, so it isn't a link. The matching
// structured data (BreadcrumbList) is added by each page through useSEO.
function Breadcrumbs({ items }) {
  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      <ol>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={item.path}>
              {isLast ? (
                <span aria-current="page">{item.name}</span>
              ) : (
                <Link to={item.path}>{item.name}</Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default Breadcrumbs;
