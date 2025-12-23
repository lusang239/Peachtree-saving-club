USE cs6400_fa25_team58;

-- =====================================================
-- Main Menu / Navigation Bar
-- =====================================================
SELECT COUNT(DISTINCT store_number) FROM Store;
SELECT COUNT(DISTINCT manufacturer_id) FROM Manufacturer;
SELECT COUNT(DISTINCT product_id) FROM Product;
SELECT COUNT(DISTINCT membership_id) FROM Membership;


-- =====================================================
-- Holiday
-- =====================================================

-- list all holiday date and name
SELECT holiday_date, holiday_name FROM Holiday;

-- Search for matched record for holiday date and name
SELECT holiday_date, holiday_name FROM Holiday
WHERE holiday_date = '$date' and holiday_name = '$holiday';

-- If not found, add holiday information
INSERT INTO Holiday (holiday_date, holiday_name) VALUE ('$date', '$holiday');


-- =====================================================
-- City
-- =====================================================


-- list all city information
SELECT city, state, population FROM City;

-- Update city population
UPDATE City SET population = '$population' WHERE city_id = '$cityid';


-- =====================================================
-- Report 1 – Manufacturer’s Product Report
-- =====================================================

-- Top 100 Manufacturers
SELECT
    m.manufacturer_id,
    manufacturer_name,
    COUNT(DISTINCT product_id) AS total_products_offered,
    ROUND(AVG(retail_price),2) AS avg_retail_price,
    MIN(retail_price) AS min_retail_price,
    MAX(retail_price) AS max_retail_price,
    ROUND(MAX(retail_price) - MIN(retail_price),2) AS retail_price_range
FROM Manufacturer AS m
    LEFT JOIN Product AS p ON m.manufacturer_id = p.manufacturer_id
GROUP BY 1
ORDER BY 4 DESC
LIMIT 100;


-- Top 100 Manufacturers Drill-down
SELECT
    p.product_id,
    product_name,
    GROUP_CONCAT(DISTINCT category_name ORDER BY category_name ASC SEPARATOR ' / ') AS category,
    retail_price
FROM Product AS p
    LEFT JOIN ProductCategory AS pc ON p.product_id = pc.product_id
WHERE manufacturer_id = '$manufacturerid'
GROUP BY 1
ORDER BY 4 DESC, 1 ASC;



-- =====================================================
-- Report 2 – Category Report
-- =====================================================
SELECT
    category_name,
    COUNT(DISTINCT pc.product_id) AS total_products,
    COUNT(DISTINCT manufacturer_id) AS total_manufacturers,
    ROUND(AVG(retail_price),2) AS avg_retail_price,
    ROUND(SUM(CASE WHEN discount_percent IS NOT NULL THEN (1 - discount_percent / 100) * retail_price * quantity ELSE retail_price * quantity END),2) AS total_revenue
FROM ProductCategory AS pc
    LEFT JOIN Product AS p ON pc.product_id = p.product_id
    LEFT JOIN Sale AS t ON pc.product_id = t.product_id
    LEFT JOIN Promotion AS o ON pc.product_id = o.product_id AND t.sale_date = o.promotion_date
GROUP BY 1
ORDER BY 1;



-- =============================================================
-- Report 3 – Actual versus Predicted Revenue for Speaker units
-- =============================================================
SELECT
    p.product_id,
    product_name,
    retail_price,
    SUM(quantity) AS total_units_sold,
    SUM(CASE WHEN discount_percent IS NOT NULL THEN quantity ELSE NULL END) AS total_units_sold_at_discount,
    SUM(CASE WHEN discount_percent IS NULL THEN quantity ELSE NULL END) AS total_units_sold_at_retail,
    ROUND(SUM(CASE WHEN discount_percent IS NOT NULL THEN (1 - discount_percent / 100) * retail_price * quantity ELSE retail_price * quantity END),2) AS actual_revenue,
    ROUND(SUM(CASE WHEN discount_percent IS NOT NULL THEN retail_price * quantity * 0.75 ELSE retail_price * quantity END),2) AS predicted_revenue,
    ROUND(SUM(CASE WHEN discount_percent IS NOT NULL THEN (1 - discount_percent / 100) * retail_price * quantity - retail_price * quantity * 0.75 ELSE NULL END),2) AS predicted_revenue_diff
FROM Product AS p
    LEFT JOIN Sale AS t ON p.product_id = t.product_id
    LEFT JOIN Promotion AS o ON p.product_id = o.product_id AND t.sale_date = o.promotion_date
WHERE p.product_id IN (SELECT product_id FROM ProductCategory WHERE category_name = 'Speaker')
GROUP BY 1
HAVING ABS(predicted_revenue_diff) > 5000
ORDER BY 9 DESC;




-- =============================================================
-- Report 4 – Store Revenue by Year by State
-- =============================================================
SELECT
    s.store_number,
    street_address,
    zip_code,
    city,
    YEAR(sale_date) AS sales_year,
    ROUND(SUM(CASE WHEN discount_percent IS NOT NULL THEN (1 - discount_percent / 100) * retail_price  * quantity ELSE retail_price * quantity END),2) AS total_revenue,
    ROUND(SUM(CASE WHEN discount_percent IS NULL THEN retail_price * quantity ELSE NULL END),2) as total_revenue_at_retail,
    ROUND(SUM(CASE WHEN discount_percent IS NOT NULL THEN (1 - discount_percent / 100) * retail_price  * quantity ELSE NULL END),2) AS total_revenue_at_discount
FROM Store AS s
    INNER JOIN City AS c ON s.city_id = c.city_id
    LEFT JOIN Sale AS t ON s.store_number = t.store_number
    LEFT JOIN Product AS p ON t.product_id = p.product_id
    LEFT JOIN Promotion as o ON t.product_id = o.product_id AND t.sale_date = o.promotion_date
WHERE state = '$state'
GROUP BY 1,5
ORDER BY 5 DESC, 6 DESC;



-- =============================================================
-- Report 5 – Air Conditioners on Groundhog Day?
-- =============================================================
SELECT
    YEAR(sale_date) AS sales_year,
    SUM(quantity) AS total_AC_units_sold,
    ROUND(IFNULL(SUM(quantity)/365,0)) AS avg_AC_units_sold_per_day,
    SUM(CASE WHEN DATE_FORMAT(sale_date, '%m-%d') = '02-02' THEN quantity ELSE NULL END) AS total_AC_units_sold_on_groundhog_day
FROM Sale
WHERE product_id IN (SELECT product_id FROM ProductCategory WHERE category_name = 'Air Conditioning')
GROUP BY 1
ORDER BY 1;


-- =============================================================
-- Report 6 – State with Highest Volume for each Category
-- =============================================================
SELECT category_name, state AS highest_sold_state, total_units_sold
FROM (
    SELECT
        category_name,
        state,
        SUM(quantity) AS total_units_sold,
        RANK() OVER (PARTITION BY category_name ORDER BY SUM(quantity) DESC) AS rnk
    FROM Sale AS t
        LEFT JOIN ProductCategory AS pc ON t.product_id = pc.product_id
        LEFT JOIN Store AS s ON t.store_number = s.store_number
        LEFT JOIN City AS ct ON s.city_id = ct.city_id
    WHERE YEAR(sale_date) = '$year' AND MONTH(sale_date) = '$month'
    GROUP BY 1,2
) AS temp
WHERE rnk = 1
ORDER BY 1;


-- =============================================================
-- Report 7 – Revenue by Population
-- =============================================================

-- option 1
WITH city_revenue AS (
    SELECT
        YEAR(sale_date) AS sales_year,
        city_id,
        SUM(CASE WHEN discount_percent IS NOT NULL THEN (1 - discount_percent/100) * retail_price * quantity ELSE retail_price * quantity END) AS revenue
    FROM Sale AS t
        LEFT JOIN Store AS s ON t.store_number = s.store_number
        LEFT JOIN Product AS p ON t.product_id = p.product_id
        LEFT JOIN Promotion AS o ON t.product_id = o.product_id AND t.sale_date = o.promotion_date
    GROUP BY 1, 2
)
SELECT
    sales_year,
    ROUND(SUM(CASE WHEN population < 3700000 THEN revenue ELSE NULL END) / COUNT(DISTINCT CASE WHEN population < 3700000 THEN ct.city_id ELSE NULL END),2) AS avg_revenue_small_cities,
    ROUND(SUM(CASE WHEN population >= 3700000 AND population < 6700000 THEN revenue ELSE NULL END) / COUNT(DISTINCT CASE WHEN population >= 3700000 AND population < 6700000 THEN ct.city_id ELSE NULL END),2) AS avg_revenue_medium_cities,
    ROUND(SUM(CASE WHEN population >= 6700000 AND population < 9000000 THEN revenue ELSE NULL END) / COUNT(DISTINCT CASE WHEN population >= 6700000 AND population < 9000000 THEN ct.city_id ELSE NULL END),2) AS avg_revenue_large_cities,
    ROUND(SUM(CASE WHEN population >= 9000000 THEN revenue ELSE NULL END) / COUNT(DISTINCT CASE WHEN population >= 9000000 THEN ct.city_id ELSE NULL END),2) AS avg_revenue_extra_large_cities
FROM City AS ct
    INNER JOIN city_revenue AS r ON ct.city_id = r.city_id
WHERE sales_year IS NOT NULL
GROUP BY 1
ORDER BY 1;

-- option 2
WITH city_revenue AS (
    SELECT
        YEAR(sale_date) AS sales_year,
        city_id,
        SUM(CASE WHEN discount_percent IS NOT NULL THEN (1 - discount_percent/100) * retail_price * quantity ELSE retail_price * quantity END) AS revenue
    FROM Sale AS t
        LEFT JOIN Store AS s ON t.store_number = s.store_number
        LEFT JOIN Product AS p ON t.product_id = p.product_id
        LEFT JOIN Promotion AS o ON t.product_id = o.product_id AND t.sale_date = o.promotion_date
    GROUP BY 1, 2
), add_category AS (
    SELECT r.*,
        (CASE WHEN population < 3700000 THEN 'Small'
            WHEN population >= 3700000 AND population < 6700000 THEN 'Medium'
            WHEN population >= 6700000 AND population < 9000000 THEN 'Large'
            WHEN population >= 9000000 THEN 'Extra Large'
            ELSE NULL END) AS city_size_category
    FROM city_revenue AS r
    JOIN City AS ct ON r.city_id = ct.city_id
), revenue_by_category AS (
    SELECT
        sales_year,
        city_size_category,
        ROUND(SUM(revenue)/COUNT(DISTINCT city_id),2) AS avg_revenue
    FROM add_category
    GROUP BY 1,2
)
SELECT
    sales_year,
    MAX(CASE WHEN city_size_category = 'Small' THEN avg_revenue ELSE NULL END) AS avg_revenue_small_cities,
    MAX(CASE WHEN city_size_category = 'Medium' THEN avg_revenue ELSE NULL END) AS avg_revenue_medium_cities,
    MAX(CASE WHEN city_size_category = 'Large' THEN avg_revenue ELSE NULL END) AS avg_revenue_large_cities,
    MAX(CASE WHEN city_size_category = 'Extra Large' THEN avg_revenue ELSE NULL END) AS avg_revenue_extra_large_cities
FROM revenue_by_category
GROUP BY 1
ORDER BY 1;




-- =============================================================
-- Report 8 – Membership Trends
-- =============================================================

-- View memberships sold per year
SELECT
    YEAR(signup_date) AS signup_year,
    COUNT(DISTINCT membership_id) AS total_memberships_sold
FROM Membership
GROUP BY 1
ORDER BY 1 DESC;

-- Top 25 Cities Drill-down
SELECT
    city,
    state,
    COUNT(DISTINCT membership_id) AS total_memberships_sold
FROM Membership AS m
    LEFT JOIN Store AS s ON m.signup_store = s.store_number
    LEFT JOIN City AS ct ON s.city_id = ct.city_id
WHERE YEAR(signup_date) = '$year'
GROUP BY 1,2
ORDER BY 3 DESC, 1 ASC
LIMIT 25;

-- Bottom 25 Cities Drill-down
SELECT
    city,
    state,
    COUNT(DISTINCT membership_id) AS total_memberships_sold
FROM Membership AS m
    LEFT JOIN Store AS s ON m.signup_store = s.store_number
    LEFT JOIN City AS ct ON s.city_id = ct.city_id
WHERE YEAR(signup_date) = '$year'
GROUP BY 1,2
ORDER BY 3, 1
LIMIT 25;


-- City to Store level Drill-down
SELECT
    store_number,
    street_address,
    zip_code,
    city,
    state,
    COUNT(DISTINCT membership_id) AS total_memberships_sold
FROM Membership AS m
    LEFT JOIN Store AS s ON m.signup_store = s.store_number
    LEFT JOIN City AS ct ON s.city_id = ct.city_id
WHERE YEAR(signup_date) = '$year' AND ct.city_id = '$cityid'
GROUP BY 1
ORDER BY 6 DESC;
