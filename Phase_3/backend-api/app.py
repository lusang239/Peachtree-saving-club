from flask import Flask, request
from dotenv import load_dotenv
from mysql.connector import Error
from db import mysql
from flask_cors import CORS

app = Flask(__name__)

load_dotenv()
app.config['MYSQL_DATABASE_USER'] = 'root'
app.config['MYSQL_DATABASE_PASSWORD'] = ''
app.config['MYSQL_DATABASE_DB'] = 'cs6400_fa25_team58'
app.config['CORS_ORIGINS'] = '*'
app.config['CORS_METHODS'] = ['GET', 'POST', 'PUT', 'DELETE']
app.config['CORS_ALLOW_HEADERS'] = 'Content-Type'
mysql.init_app(app)
CORS().init_app(app)

@app.get('/metrics')
def get_homepage_metrics():
    cursor = mysql.get_db().cursor()
    cursor.execute('''
        SELECT COUNT(DISTINCT store_number) FROM Store
        UNION ALL
        SELECT COUNT(DISTINCT manufacturer_id) FROM Manufacturer
        UNION ALL
        SELECT COUNT(DISTINCT product_id) FROM Product
        UNION ALL
        SELECT COUNT(DISTINCT membership_id) FROM Membership    
    ''')
    rows = cursor.fetchall()                           
    cursor.close()
    return {'total_stores': rows[0][0], 'total_manufacturers': rows[1][0], 'total_products': rows[2][0], 'total_memberships': rows[3][0]}

@app.route('/holidays', methods=['GET', 'POST'])
def holiday():
    if request.method == 'GET':
        cursor = mysql.get_db().cursor()
        cursor.execute('SELECT * FROM Holiday')
        rows = cursor.fetchall()
        holidays = [{'holiday_date': row[0].strftime('%Y-%m-%d'), 'holiday_name': row[1]} for row in rows]
        cursor.close()
        return {'holidays': holidays}
    else:
        req = request.get_json()

        if 'date' in req and 'holiday' in req and req['holiday'].strip() == "":
            return {'message': 'Holiday name cannot be empty'}, 400
        
        try:
            cnx = mysql.get_db()
            cursor = cnx.cursor()

            find_holiday_query = 'SELECT * FROM Holiday WHERE holiday_date = %s'
            cursor.execute(find_holiday_query, req['date'])
            row = cursor.fetchone()
            
            if row is not None:
                return {'message': 'Holiday already existed.'}, 409
            
            holiday_data = (req['date'], req['holiday'])
            cursor.execute('INSERT INTO Holiday (holiday_date, holiday_name) VALUE (%s, %s)', holiday_data)
            new_holiday = {'date': req['date'], 'holiday': req['holiday']}

            cnx.commit()
            cursor.close()
            return {'New Holiday': new_holiday}, 201
        except Error as err:
            return {'message': err.msg}, err.errno                                       



@app.route('/city-population', methods=['GET', 'PUT'])
def get_city_population():
    if request.method == 'GET':
        cursor = mysql.get_db().cursor()
        cursor.execute('SELECT * FROM City ORDER BY state, city')
        rows = cursor.fetchall()
        city_population = [{'city_id': row[0], 'city': row[1], 'state': row[2], 'population': row[3]} for row in rows]
        cursor.close()
        return {'city_population': city_population}
    else:
        req = request.get_json()
        try:
            cnx = mysql.get_db()
            cursor = cnx.cursor()
   
            update_population_query = 'UPDATE City SET population = %s WHERE city = %s AND state = %s'
            data_population = (req['population'], req['city'], req['state'])
            cursor.execute(update_population_query, data_population)
            
            cnx.commit()
            cursor.close()
            return {'message': 'Population has been updated'}, 201
        except Error as err:
            return {'message': err.msg}, err.errno


@app.get('/manufacturers')
def get_manufacturers():
    cursor = mysql.get_db().cursor()
    cursor.execute('''
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
        LIMIT 100
    ''')
    rows = cursor.fetchall()
    cursor.close()
    manufacturers = [{'manufacturer_id': row[0], 
                      'manufacturer_name': row[1], 
                      'total_products_offered': row[2], 
                      'avg_retail_price': row[3], 
                      'min_retail_price': row[4], 
                      'max_retail_price': row[5], 
                      'retail_price_range': row[6]} 
                      for row in rows]
    return {'manufacturers': manufacturers}

@app.get('/manufacturers/<string:mid>')
def get_manufacturer(mid):
    cursor = mysql.get_db().cursor()
    cursor.execute('SELECT * FROM Manufacturer WHERE manufacturer_id = %s', mid)
    row = cursor.fetchone()
    cursor.close()
    manufacturer = [{'manufacturer_id': row[0], 'manufacturer_name': row[1], 'maximum_discount': row[2]}]
    return {'manufacturer': manufacturer}

@app.get('/manufacturer-detail/<string:mid>')
def get_manufacturer_products(mid):
    cursor = mysql.get_db().cursor()
    cursor.execute('''
        SELECT
            p.product_id,
            product_name,
            GROUP_CONCAT(DISTINCT category_name ORDER BY category_name ASC SEPARATOR ' / ') AS category,
            retail_price
        FROM Product AS p
            LEFT JOIN ProductCategory AS pc ON p.product_id = pc.product_id
        WHERE manufacturer_id = %s
        GROUP BY 1
        ORDER BY 4 DESC, 1 ASC
    ''', mid)
    rows = cursor.fetchall()
    cursor.close()
    manufacturer_detail = [{'product_id': row[0], 
                            'product_name': row[1], 
                            'category': row[2], 
                            'retail_price': row[3]} 
                            for row in rows]
    return {'manufacturer_detail': manufacturer_detail}


@app.get('/category-report')
def get_category_report():
    cursor = mysql.get_db().cursor()
    cursor.execute('''
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
        ORDER BY 1
    ''')
    rows = cursor.fetchall()
    cursor.close()
    category_report = [{'category_name': row[0], 
                        'total_products': row[1], 
                        'total_manufacturers': row[2], 
                        'avg_retail_price': row[3],
                        'total_revenue': row[4]} 
                        for row in rows]
    return {'category_report': category_report}



@app.get('/speaker-revenue-comparison')
def get_speaker_revenue_comparison():
    cursor = mysql.get_db().cursor()
    cursor.execute('''
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
        ORDER BY 9 DESC
    ''')
    rows = cursor.fetchall()
    cursor.close()
    speaker_revenue_compare = [{'product_id': row[0], 
                                'product_name': row[1], 
                                'retail_price': row[2], 
                                'total_units_sold': row[3],
                                'total_units_sold_at_discount': row[4],
                                'total_units_sold_at_retail': row[5],
                                'actual_revenue': row[6],
                                'predicted_revenue': row[7],
                                'predicted_revenue_diff': row[8]} 
                                for row in rows]
    return {'speaker_revenue_compare': speaker_revenue_compare}

@app.get('/states')
def get_states():
    cursor = mysql.get_db().cursor()
    cursor.execute('SELECT DISTINCT state FROM City ORDER BY 1')
    rows = cursor.fetchall()
    cursor.close()
    states = [row[0] for row in rows]
    return {'states': states}


@app.get('/store-revenue-by-year-by-state/<string:state>')
def get_store_revenue(state):
    cursor = mysql.get_db().cursor()
    cursor.execute('''
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
        WHERE state = %s
        GROUP BY 1,5
        ORDER BY 5 DESC, 6 DESC
    ''', state)
    rows = cursor.fetchall()
    cursor.close()
    store_revenue = [{'store_number': row[0], 
                        'street_address': row[1], 
                        'zip_code': row[2], 
                        'city': row[3],
                        'sales_year': row[4],
                        'total_revenue': row[5],
                        'total_revenue_at_retail': row[6],
                        'total_revenue_at_discount': row[7]} 
                        for row in rows]
    return {'store_revenue': store_revenue}


@app.get('/groundhog-day-ac')
def get_groundhog_day_ac():
    cursor = mysql.get_db().cursor()
    cursor.execute('''
        SELECT
            YEAR(sale_date) AS sales_year,
            SUM(quantity) AS total_AC_units_sold,
            ROUND(IFNULL(SUM(quantity)/365,0)) AS avg_AC_units_sold_per_day,
            SUM(CASE WHEN DATE_FORMAT(sale_date, '%m-%d') = '02-02' THEN quantity ELSE NULL END) AS total_AC_units_sold_on_groundhog_day
        FROM Sale
        WHERE product_id IN (SELECT product_id FROM ProductCategory WHERE category_name = 'Air Conditioning')
        GROUP BY 1
        ORDER BY 1
    ''')
    rows = cursor.fetchall()
    cursor.close()
    groundhog_day_ac_sales = [{'sales_year': row[0], 
                                'total_AC_units_sold': row[1], 
                                'avg_AC_units_sold_per_day': row[2], 
                                'total_units_sold_on_groundhog_day': row[3]} 
                                for row in rows]
    return {'groundhog_day_ac_sales': groundhog_day_ac_sales}

@app.get('/years')
def get_years():
    cursor = mysql.get_db().cursor()
    cursor.execute('SELECT DISTINCT YEAR(calendar_date) AS year FROM Calendar ORDER BY 1 DESC')
    rows = cursor.fetchall()
    cursor.close()
    years = [row[0] for row in rows]
    return {'years': years}

@app.get('/category-top-state/<int:year>/<int:month>')
def get_category_top_state(year, month):
    cursor = mysql.get_db().cursor()
    cursor.execute('''
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
            WHERE YEAR(sale_date) = %s AND MONTH(sale_date) = %s
            GROUP BY 1,2
        ) AS temp
        WHERE rnk = 1
        ORDER BY 1
    ''', (year, month))
    rows = cursor.fetchall()
    cursor.close()
    category_top_state = [{'category_name': row[0], 
                            'highest_sold_state': row[1], 
                            'total_units_sold': row[2]} 
                            for row in rows]
    return {'category_top_state': category_top_state}


@app.get('/revenue-per-population')
def get_revenue_per_population():
    cursor = mysql.get_db().cursor()
    cursor.execute('''
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
        ORDER BY 1
    ''')
    rows = cursor.fetchall()
    cursor.close()
    revenue_per_population = [{'sales_year': row[0], 
                                'avg_revenue_small_cities': row[1], 
                                'avg_revenue_medium_cities': row[2],
                                'avg_revenue_large_cities': row[3],
                                'avg_revenue_extra_large_cities': row[4]} 
                                for row in rows]
    return {'revenue_per_population': revenue_per_population}

@app.get('/memberships')
def get_membership_trend():
    cursor = mysql.get_db().cursor()
    cursor.execute('''
        SELECT
            YEAR(signup_date) AS signup_year,
            COUNT(DISTINCT membership_id) AS total_memberships_sold
        FROM Membership
        GROUP BY 1
        ORDER BY 1 DESC
    ''')
    rows = cursor.fetchall()
    cursor.close()
    memberships_trend = [{'signup_year': row[0], 
                            'total_memberships_sold': row[1]} 
                            for row in rows]
    return {'memberships_trend': memberships_trend}

@app.get('/memberships/top-25-cities/<int:year>')
def get_top_cities(year):
    cursor = mysql.get_db().cursor()
    cursor.execute('''
        SELECT
            s.city_id,
            city,
            state,
            COUNT(DISTINCT membership_id) AS total_memberships_sold,
            COUNT(DISTINCT store_number) AS total_stores
        FROM Membership AS m
            LEFT JOIN Store AS s ON m.signup_store = s.store_number
            LEFT JOIN City AS ct ON s.city_id = ct.city_id
        WHERE YEAR(signup_date) = %s
        GROUP BY 1
        ORDER BY 4 DESC, 2 ASC
        LIMIT 25
    ''', year)
    rows = cursor.fetchall()
    cursor.close()
    top_25_cities = [{'city_id': row[0], 
                        'city': row[1], 
                        'state': row[2], 
                        'total_memberships_sold': row[3], 
                        'total_stores': row[4]} 
                        for row in rows]
    return {'top_25_cities': top_25_cities}
    
@app.get('/memberships/bottom-25-cities/<int:year>')
def get_bottom_cities(year):
    cursor = mysql.get_db().cursor()
    cursor.execute('''
        SELECT
            s.city_id,
            city,
            state,
            COUNT(DISTINCT membership_id) AS total_memberships_sold,
            COUNT(DISTINCT store_number) AS total_stores
        FROM Membership AS m
            LEFT JOIN Store AS s ON m.signup_store = s.store_number
            LEFT JOIN City AS ct ON s.city_id = ct.city_id
        WHERE YEAR(signup_date) = %s
        GROUP BY 1
        ORDER BY 4, 2
        LIMIT 25
    ''', year)
    rows = cursor.fetchall()
    cursor.close()
    bottom_25_cities = [{'city_id': row[0], 
                        'city': row[1], 
                        'state': row[2], 
                        'total_memberships_sold': row[3], 
                        'total_stores': row[4]} 
                        for row in rows]
    return {'bottom_25_cities': bottom_25_cities}

@app.get('/memberships/<int:year>/<string:cityid>')
def get_store_info(year, cityid):
    cursor = mysql.get_db().cursor()
    cursor.execute('''
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
        WHERE YEAR(signup_date) = %s AND s.city_id = %s
        GROUP BY 1
        ORDER BY 6 DESC
    ''', (year, cityid))
    rows = cursor.fetchall()
    cursor.close()
    store_info = [{'store_number': row[0], 
                    'street_address': row[1], 
                    'zip_code': row[2], 
                    'city': row[3],
                    'state': row[4],
                    'total_memberships_sold': row[5]} 
                    for row in rows]    
    return {'store_info': store_info}

if __name__ == '__main__':
    app.run()