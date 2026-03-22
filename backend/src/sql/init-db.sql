-- ----------  USERS  --------------------------------------------------------
CREATE TABLE users (
    user_id        INTEGER NOT NULL PRIMARY KEY,
    username       VARCHAR(50)  UNIQUE NOT NULL,
    password_hash  CHAR(60)     NOT NULL,
    first_name     VARCHAR(50),
    last_name      VARCHAR(50),
    email          VARCHAR(255) UNIQUE NOT NULL,
    gender         CHAR(1), --gender IN ('M','F','O')
    dob            DATE,
    description    VARCHAR(1000),
    avatar_id      INTEGER,
    is_admin       BOOLEAN      DEFAULT FALSE,
    created_dttm   DATETIME  DEFAULT CURRENT_TIMESTAMP
);

-- ----------  ARTICLES  -----------------------------------------------------
CREATE TABLE articles (
    article_id     INTEGER NOT NULL PRIMARY KEY,
    user_id        INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    title          VARCHAR(255) NOT NULL,
    content        VARCHAR(6000) NOT NULL,
    is_deleted     BOOLEAN DEFAULT 0,
    created_dttm   DATETIME  DEFAULT CURRENT_TIMESTAMP,
    updated_dttm   DATETIME
);

-- ----------  TAGS + bridge  ------------------------------------------------
CREATE TABLE tags (
    tag_id    INTEGER NOT NULL PRIMARY KEY,
    tag_name  VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE article_tags (
    article_id INTEGER NOT NULL REFERENCES articles(article_id) ON DELETE CASCADE,
    tag_id     INTEGER NOT NULL REFERENCES tags(tag_id),
    PRIMARY KEY (article_id, tag_id)
);

-- ----------  ARTICLE IMAGES  ----------------------------------------------
CREATE TABLE article_images (
    article_id   INTEGER NOT NULL REFERENCES articles(article_id) ON DELETE CASCADE,
    image_id     INTEGER NOT NULL,
    image_url    VARCHAR(2000) NOT NULL,
    created_dttm DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (article_id, image_id)
);

-- ----------  COMMENTS  -----------------------------------------------------
CREATE TABLE comments (
    comment_id   INTEGER NOT NULL PRIMARY KEY,
    article_id   INTEGER NOT NULL REFERENCES articles(article_id) ON DELETE CASCADE,
    parent_id      INTEGER  REFERENCES comments(comment_id) ON DELETE CASCADE,  
    user_id      INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    content      VARCHAR(6000) NOT NULL,
    created_dttm DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_dttm DATETIME,   
    is_deleted BOOLEAN DEFAULT 0
);

-- ----------  COMMENT MENTIONS  --------------------------------------------
CREATE TABLE comment_mentions (
    comment_id    INTEGER NOT NULL REFERENCES comments(comment_id) ON DELETE CASCADE,
    mentioned_id  INTEGER REFERENCES users(user_id)  ON DELETE SET NULL,
    created_dttm  DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (comment_id, mentioned_id)
);

-- ----------  ARTICLE LIKES  -----------------------------------------------
CREATE TABLE article_likes (
    user_id      INTEGER NOT NULL REFERENCES users(user_id)  ON DELETE CASCADE  ,
    article_id   INTEGER NOT NULL REFERENCES articles(article_id) ON DELETE CASCADE,
    created_dttm DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, article_id)           
);

-- ----------  SUBSCRIPTIONS  ------------------------------------------------
CREATE TABLE subscriptions (
    subscription_id INTEGER NOT NULL PRIMARY KEY,
    subscriber_id   INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    target_user_id  INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    created_dttm    DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (subscriber_id, target_user_id)         
);

-- ----------  NOTIFICATIONS  ------------------------------------------------
CREATE TABLE Notifications (
    notification_id INTEGER PRIMARY KEY,
    sender_id INTEGER,
    receiver_id INTEGER,
    type TEXT, -- values like 'new_article' or 'tag_comment'
    article_id INTEGER,
    comment_id INTEGER,
    delivered_dttm DATETIME,
    read_dttm DATETIME,
    clicked_dttm DATETIME,
    is_read BOOLEAN DEFAULT 0,
    created_dttm DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (article_id) REFERENCES Articles(article_id) ON DELETE CASCADE,
    FOREIGN KEY (comment_id) REFERENCES Comments(comment_id) ON DELETE CASCADE
);

-- ----------  AVATAR  ------------------------------------------------
CREATE TABLE Avatar (
    avatar_id INTEGER PRIMARY KEY,  
    avatar_url VARCHAR(2000) NOT NULL 
);


---DUMMY DATA----------------------

INSERT INTO users (username, password_hash, first_name, last_name, email, gender, dob, description, avatar_id, is_admin)
VALUES
('annie88', '$2b$10$4bmmaVeEAWG2yH/AEodMZe4h4xdLoD7U0/Au.tKYO5G9p7vBjo4Pq', 'Annie', 'Lee', 'annie@example.com', 'F', '1995-01-12', 'Group 8 is awesome!', 1, FALSE),
('admin123', '$2b$10$4bmmaVeEAWG2yH/AEodMZe4h4xdLoD7U0/Au.tKYO5G9p7vBjo4Pq', 'Admin', 'is me', 'ann@example.com', 'F', '1995-01-12', 'I am Admin', 2, TRUE),
('sherryx', '$2b$10$xrhabxQKjLKOrKxUbDk5/.u1ydbSuwUNpkMc6lmu/V8MfcJFDifWS', 'Sherry', 'Ng', 'sherry@example.com', 'F', '1993-05-23', 'Frontend developer.', 3, FALSE),
('yangdev', '$2b$10$xrhabxQKjLKOrKxUbDk5/.u1ydbSuwUNpkMc6lmu/V8MfcJFDifWS', 'Yang', 'Chen', 'yang@example.com', 'M', '1992-07-15', 'Backend specialist.', 3, FALSE),
('steven777', '$2b$10$xrhabxQKjLKOrKxUbDk5/.u1ydbSuwUNpkMc6lmu/V8MfcJFDifWS', 'Steven', 'Khoo', 'steven@example.com', 'M', '1994-03-08', 'Full stack engineer.', 1, TRUE),
('liplogic', '$2b$10$xrhabxQKjLKOrKxUbDk5/.u1ydbSuwUNpkMc6lmu/V8MfcJFDifWS', 'Lip', 'Tan', 'lip@example.com', 'M', '1990-12-20', 'Project manager.', 5, FALSE),
('alice01', '$2b$10$xrhabxQKjLKOrKxUbDk5/.u1ydbSuwUNpkMc6lmu/V8MfcJFDifWS', 'Alice', 'Wong', 'alice@example.com', 'F', '1991-02-10', 'Traveller.', 2, FALSE),
('bobthebuilder', '$2b$10$xrhabxQKjLKOrKxUbDk5/.u1ydbSuwUNpkMc6lmu/V8MfcJFDifWS', 'Bob', 'Builder', 'bob@example.com', 'M', '1989-09-22', 'Engineer.', 3, FALSE),
('clarenceC', '$2b$10$xrhabxQKjLKOrKxUbDk5/.u1ydbSuwUNpkMc6lmu/V8MfcJFDifWS', 'Clarence', 'Chen', 'clarence@example.com', 'M', '1993-03-03', 'Barista.', 4, FALSE),
('daniD', '$2b$10$xrhabxQKjLKOrKxUbDk5/.u1ydbSuwUNpkMc6lmu/V8MfcJFDifWS', 'Dani', 'Dale', 'dani@example.com', 'F', '1990-04-04', 'Designer.', 1, FALSE),
('emilyE', '$2b$10$xrhabxQKjLKOrKxUbDk5/.u1ydbSuwUNpkMc6lmu/V8MfcJFDifWS', 'Emily', 'Evans', 'emily@example.com', 'F', '1996-06-06', 'Photographer.', 2, FALSE),
('felixF', '$2b$10$xrhabxQKjLKOrKxUbDk5/.u1ydbSuwUNpkMc6lmu/V8MfcJFDifWS', 'Felix', 'Fox', 'felix@example.com', 'M', '1992-07-07', 'Writer.', 3, FALSE),
('graceG', '$2b$10$xrhabxQKjLKOrKxUbDk5/.u1ydbSuwUNpkMc6lmu/V8MfcJFDifWS', 'Grace', 'Green', 'grace@example.com', 'F', '1988-08-08', 'Chef.', 4, FALSE),
('harryH', '$2b$10$xrhabxQKjLKOrKxUbDk5/.u1ydbSuwUNpkMc6lmu/V8MfcJFDifWS', 'Harry', 'Hunt', 'harry@example.com', 'M', '1987-09-09', 'Critic.', 5, FALSE),
('ireneI', '$2b$10$xrhabxQKjLKOrKxUbDk5/.u1ydbSuwUNpkMc6lmu/V8MfcJFDifWS', 'Irene', 'Ink', 'irene@example.com', 'F', '1991-10-10', 'Artist.', 1, FALSE),
('johnJ', '$2b$10$xrhabxQKjLKOrKxUbDk5/.u1ydbSuwUNpkMc6lmu/V8MfcJFDifWS', 'John', 'Jones', 'john@example.com', 'M', '1993-11-11', 'Musician.', 2, FALSE),
('kateK', '$2b$10$xrhabxQKjLKOrKxUbDk5/.u1ydbSuwUNpkMc6lmu/V8MfcJFDifWS', 'Kate', 'Kim', 'kate@example.com', 'F', '1994-12-12', 'Student.', 3, FALSE),
('leoL', '$2b$10$xrhabxQKjLKOrKxUbDk5/.u1ydbSuwUNpkMc6lmu/V8MfcJFDifWS', 'Leo', 'Lim', 'leo@example.com', 'M', '1990-01-01', 'Writer.', 4, FALSE),
('mariaM', '$2b$10$xrhabxQKjLKOrKxUbDk5/.u1ydbSuwUNpkMc6lmu/V8MfcJFDifWS', 'Maria', 'Moe', 'maria@example.com', 'F', '1992-02-02', 'Cafe lover.', 5, FALSE),
('noahN', '$2b$10$xrhabxQKjLKOrKxUbDk5/.u1ydbSuwUNpkMc6lmu/V8MfcJFDifWS', 'Noah', 'Nguyen', 'noah@example.com', 'M', '1995-03-03', 'Wanderer.', 1, FALSE),
('oliviaO', '$2b$10$xrhabxQKjLKOrKxUbDk5/.u1ydbSuwUNpkMc6lmu/V8MfcJFDifWS', 'Olivia', 'Oak', 'olivia@example.com', 'F', '1996-04-04', 'Blogger.', 2, FALSE);


INSERT INTO articles (article_id, user_id, title, content, is_deleted, created_dttm, updated_dttm)
VALUES
(1, 1, 'Top 5 Hidden Cafes in Kyoto',
"<h1><u>Top 5 Hidden Cafes in Kyoto</u></h1>

  <p>Kyoto is famous for its temples, geishas, and traditional tea houses. But tucked away in its narrow alleys and quiet neighborhoods are some <b>truly hidden gems</b> for coffee and dessert lovers. If you're looking to escape the tourist crowds and discover cozy spots locals adore, here are the <b>top 5 hidden cafes in Kyoto</b> that you must try.</p>

  <h2><u>1. Café Bibliotic Hello!</u></h2>
  <p>Step into a world of <i>rustic wooden shelves and vintage charm</i>. Located near Kyoto Imperial Palace, this cafe is part library, part bakery. Their house-made bread is to die for, and their cappuccinos are consistently perfect. Don’t forget to browse their collection of books while sipping your coffee!</p>

  <h2><u>2. Weekenders Coffee</u></h2>
  <p>This tiny cafe hidden in a parking lot behind Teramachi Street is a <b>coffee lover’s dream</b>. It might be hard to find, but the moment you taste their expertly brewed single-origin beans, you’ll realize it was worth the search. <i>Minimalist decor</i> and a serious focus on quality make this a must-visit for espresso aficionados.</p>

  <h2><u>3. Walden Woods Kyoto</u></h2>
  <p>Inspired by Henry David Thoreau’s <i>“Walden”</i>, this white-walled, minimalist cafe offers a unique experience. No chairs — just a clean, open space where visitors sit on the wooden steps and enjoy simple drinks. Try their signature latte or chai, and enjoy the peaceful, contemplative vibe.</p>

  <h2><u>4. Café Sarasa Nishijin</u></h2>
  <p>Once a traditional bathhouse, this quirky cafe has retained many of its <b>original features</b>, including tiled walls and high ceilings. Located in the Nishijin district, it serves a <i>variety of delicious lunch plates and desserts</i>. A great place to relax and feel Kyoto's old-meets-new charm.</p>

  <h2><u>5. Arabica Arashiyama</u></h2>
  <p>While Arabica is now a global name, their Arashiyama branch remains a hidden gem, especially early in the morning. With views of the Katsura River and bamboo groves, it’s an <b>Instagram-worthy location</b> with some of the smoothest coffee in town. Go for their famous <i>Spanish Latte</i> and take in the scenery.</p>

  <h3><u>Bonus Tips:</u></h3>
  <ul>
    <li><b>Go early</b> — many of these cafes get busy fast, especially on weekends.</li>
    <li><b>Bring cash</b> — not all places accept credit cards.</li>
    <li><b>Respect local customs</b> — speak softly and avoid lingering too long if it’s crowded.</li>
  </ul>

  <p>Whether you're a coffee connoisseur or just looking for a quiet place to reflect, these <i>hidden cafes in Kyoto</i> offer something magical. Don’t just visit the city — sip, savor, and <b>experience it one cup at a time</b>.</p>
",
0, '2025-05-10 10:00:00', '2025-05-12 08:30:00'),

(2, 2, 'Melbourne Sweet Tooth Tour',
"<h1><u>Melbourne Sweet Tooth Tour</u></h1>

  <p>If you have a <b>sweet tooth</b> and you're in Melbourne, you're in luck. This city is a <i>dessert lover’s paradise</i>, offering everything from traditional Aussie treats to modern fusion creations. Whether you're strolling through laneways or hanging out in hip neighborhoods, there’s always a delicious indulgence waiting to be discovered. Join us on a <b>Melbourne Sweet Tooth Tour</b> that will leave your taste buds tingling!</p>

  <h2><u>1. Lune Croissanterie</u></h2>
  <p>Located in Fitzroy, <b>Lune Croissanterie</b> is <i>world-famous for a reason</i>. Their buttery, flaky croissants are baked with scientific precision and artistic flair. Go early — lines form quickly, and the almond croissant sells out fast. <i>Don’t miss their seasonal specials</i> either!</p>

  <h2><u>2. Pidapipó Gelateria</u></h2>
  <p>If you're craving <b>authentic Italian gelato</b>, head to Pidapipó on Lygon Street. With creamy textures and bold flavors like pistachio, ricotta fig, and Nutella swirl, it’s a scoop of pure happiness. Bonus: their <i>chocolate fountain over gelato cones</i> is a must-try for any sweet addict.</p>

  <h2><u>3. Bibelot</u></h2>
  <p>This South Melbourne patisserie is a <i>temple of indulgence</i>. Bibelot offers exquisite cakes, artisan chocolates, and handmade gelato all under one roof. Their matcha tart and passionfruit mousse cake are crowd favorites. It’s an <b>elegant stop for both taste and presentation</b>.</p>

  <h2><u>4. Agathé Pâtisserie</u></h2>
  <p>Hidden inside South Melbourne Market, Agathé Pâtisserie is a small but mighty bakery. Their <i>cruffins</i> — a hybrid of croissant and muffin — are filled with everything from matcha cream to lemon curd. <b>Unique, flaky, and unforgettable</b>.</p>

  <h2><u>5. Burch & Purchese Sweet Studio</u></h2>
  <p>For a modern twist on desserts, this studio in South Yarra creates <b>edible works of art</b>. Known for intricate layered cakes, marshmallows, and quirky flavor combinations like chocolate, rosemary, and olive oil, it’s a <i>lab for dessert innovation</i>. A dream for the adventurous palate.</p>

  <h3><u>Pro Tips for the Tour:</u></h3>
  <ul>
    <li><b>Bring friends</b> — sharing means you can try more treats!</li>
    <li><b>Stay hydrated</b> — all that sugar needs some balance.</li>
    <li><b>Take photos</b> — these desserts are as beautiful as they are tasty.</li>
  </ul>

  <p>Melbourne’s dessert scene is vibrant, creative, and absolutely delicious. Whether you're into flaky pastries, frozen delights, or experimental sweets, there's something here for every craving. So go ahead — <b>embrace your sweet side</b> and take a bite out of Melbourne’s best!</p>
",
0, '2025-05-11 14:20:00', '2025-05-15 08:30:00'),

(3, 1, 'Backpacking the South Island of NZ',
"<h1><u>Backpacking the South Island of NZ</u></h1>

  <p>Backpacking through New Zealand’s South Island is an <b>unforgettable experience</b>. Known for its dramatic landscapes, welcoming locals, and endless adventure opportunities, this region is perfect for anyone looking to connect with nature and travel on a budget. From snow-capped mountains to turquoise lakes, here's how to make the most of your South Island adventure.</p>

  <h2><u>Must-See Destinations</u></h2>
  <ul>
    <li><b>Queenstown</b> – The <i>adventure capital of the world</i>, offering everything from bungee jumping to lake cruises.</li>
    <li><b>Fiordland National Park</b> – Home to <i>Milford Sound</i> and <i>Doubtful Sound</i>, these fjords are absolutely breathtaking.</li>
    <li><b>Wanaka</b> – A more relaxed alternative to Queenstown with amazing hikes like <i>Roy’s Peak</i>.</li>
    <li><b>Lake Tekapo</b> – Famous for its <b>bright turquoise water</b> and the Church of the Good Shepherd.</li>
    <li><b>Kaikoura</b> – A coastal town perfect for <i>whale watching</i> and enjoying fresh seafood.</li>
  </ul>

  <h2><u>Budget Tips</u></h2>
  <ul>
    <li><b>Use a campervan</b> – Save on accommodation and enjoy the freedom to park in stunning locations.</li>
    <li><b>Shop at supermarkets</b> – Cooking your own meals helps stretch your travel funds.</li>
    <li><b>Join backpacker Facebook groups</b> – Find rideshares and local travel tips.</li>
    <li><b>Get a DOC Campsite Pass</b> – Access basic campgrounds for low fees.</li>
  </ul>

  <h2><u>Top Activities</u></h2>
  <p>Don’t miss out on the <b>iconic hikes</b> such as the Routeburn Track or Hooker Valley Track in Aoraki/Mt Cook National Park. If you're into thrill-seeking, try <i>skydiving, canyoning, or white-water rafting</i>. Nature lovers will adore the glowworm caves in Te Anau and the penguin colonies in Oamaru.</p>

  <h2><u>Final Thoughts</u></h2>
  <p>The South Island is a place where you can truly unplug and experience the raw beauty of nature. Whether you're chasing adrenaline, relaxing in quiet lakeside towns, or exploring national parks, this journey will leave you with memories to last a lifetime. So pack light, travel smart, and <b>let the South Island take your breath away</b>.</p>
",
0, '2025-05-13 09:00:00', '2025-05-15 11:45:00'),

(4, 2, 'Best Spicy Dishes in Bangkok',
"<h1><u>Best Spicy Dishes in Bangkok</u></h1>

  <p>If there’s one thing Bangkok is famous for beyond its vibrant markets and temples, it's the <b>fiery and flavorful cuisine</b>. From street stalls to local eateries, the city offers a treasure trove of spicy dishes that will ignite your taste buds. Whether you're a chili fan or a culinary adventurer, here are the <b>top spicy dishes you must try</b> in Bangkok.</p>

  <h2><u>1. Som Tum (Spicy Green Papaya Salad)</u></h2>
  <p>This classic Thai salad is made with <i>shredded green papaya, chili, garlic, lime, and fish sauce</i>. It's sweet, sour, salty, and incredibly spicy — especially if you order it “Thai style.” Best enjoyed with sticky rice or grilled chicken on the side.</p>

  <h2><u>2. Tom Yum Goong (Spicy Shrimp Soup)</u></h2>
  <p>Tom Yum is one of Thailand’s most iconic soups. <b>Packed with lemongrass, galangal, kaffir lime leaves, and red chilies</b>, it offers a perfect balance of heat and citrus. The shrimp version is the most popular, but there are also chicken and vegetarian options.</p>

  <h2><u>3. Pad Kra Pao (Holy Basil Stir Fry)</u></h2>
  <p>Often considered a go-to lunch dish for locals, Pad Kra Pao combines minced meat (usually pork or chicken) stir-fried with garlic, chili, and holy basil. Served with rice and topped with a <i>crispy fried egg</i>, it’s spicy, savory, and deeply satisfying.</p>

  <h2><u>4. Gaeng Daeng (Red Curry)</u></h2>
  <p>This creamy yet spicy curry is made with <b>red chili paste, coconut milk, meat, and Thai herbs</b>. It’s rich, aromatic, and best served with a bowl of jasmine rice. Each restaurant has its own twist, so don’t hesitate to try more than one version!</p>

  <h2><u>5. Laab (Spicy Minced Meat Salad)</u></h2>
  <p>Originating from northeastern Thailand, Laab is a <i>zesty minced meat dish</i> tossed with lime juice, chili flakes, fresh herbs, and toasted rice powder. It’s fresh, spicy, and slightly nutty — a great option for those who enjoy a textural punch.</p>

  <h3><u>Tips for Spicy Food Lovers:</u></h3>
  <ul>
    <li><b>Start small</b> – Thai spicy can be intense, so ask for “mild” if you’re unsure.</li>
    <li><b>Cool down with rice</b> – Rice helps balance the heat and complements every dish.</li>
    <li><b>Have Thai iced tea</b> – The sweetness and creaminess help soothe the burn.</li>
  </ul>

  <p>Bangkok's spicy dishes are more than just heat — they are <i>layers of flavor and cultural expression</i>. Whether you're eating at a street cart or a local kitchen, these dishes will give you a real taste of Thai fire. <b>Just don’t forget to bring tissues!</b></p>
",
0, '2025-05-14 12:00:00', '2025-05-25 08:30:00'),

(5, 5, 'How to Travel Japan on a Budget',
"<h1><u>How to Travel Japan on a Budget</u></h1>

  <p>Japan is often seen as an expensive destination, but with smart planning, you can explore its rich culture, cutting-edge cities, and peaceful countryside <b>without breaking the bank</b>. From transportation to meals, here’s how to <b>travel Japan on a budget</b> while still enjoying a truly unforgettable experience.</p>

  <h2><u>1. Use Budget Transportation</u></h2>
  <ul>
    <li><b>JR Pass</b> – Ideal for long-distance travel. This pass offers <i>unlimited rides on Japan Rail lines</i>, including most Shinkansen (bullet trains).</li>
    <li><b>Highway Buses</b> – Great for overnight trips between cities like Tokyo, Kyoto, and Osaka. Comfortable and much cheaper than trains.</li>
    <li><b>IC Cards</b> – Prepaid cards like Suica or Pasmo make it easy and cheaper to ride subways and buses.</li>
  </ul>

  <h2><u>2. Stay in Budget Accommodations</u></h2>
  <ul>
    <li><b>Hostels and Guesthouses</b> – Clean, friendly, and often come with <i>free breakfast or kitchen access</i>.</li>
    <li><b>Capsule Hotels</b> – A unique Japanese experience that’s perfect for solo travelers.</li>
    <li><b>Business Hotels</b> – Compact but comfortable rooms with <i>affordable rates and great locations</i>.</li>
  </ul>

  <h2><u>3. Eat Cheap (and Delicious)</u></h2>
  <ul>
    <li><b>Convenience Stores</b> – Lawson, FamilyMart, and 7-Eleven offer <i>fresh, cheap meals</i> like onigiri, bento, and noodles.</li>
    <li><b>Standing Sushi Bars</b> – Affordable sushi that doesn’t skimp on quality.</li>
    <li><b>Chain Restaurants</b> – Try Sukiya, Matsuya, or Coco Ichibanya for <b>budget-friendly local dishes</b>.</li>
  </ul>

  <h2><u>4. Free and Low-Cost Attractions</u></h2>
  <p>Many of Japan’s most beautiful places are free to enjoy. Explore <b>temples, shrines, gardens, and scenic hikes</b> without paying an entrance fee. Major cities also offer <i>free observation decks</i>, public museums, and cultural festivals.</p>

  <h2><u>5. Pocket WiFi or SIM Card</u></h2>
  <p>To avoid expensive roaming fees, rent a <b>pocket WiFi</b> or buy a <i>prepaid SIM card</i> at the airport or online before arrival. Staying connected helps with directions, translations, and transport apps.</p>

  <h3><u>Bonus Budget Tips:</u></h3>
  <ul>
    <li><b>Travel off-season</b> – Spring and autumn are beautiful, but winter (excluding New Year) offers lower prices.</li>
    <li><b>Get a coin locker</b> – Store your luggage for cheap while you explore freely.</li>
    <li><b>Use 100-yen shops</b> – They sell everything from snacks to souvenirs!</li>
  </ul>

  <p>Traveling Japan doesn’t have to be expensive. With some smart choices and a little flexibility, you can experience the beauty, kindness, and excitement of Japan <b>on a shoestring</b>. <i>Your budget adventure awaits!</i></p>
",
0, '2025-05-15 16:30:00', '2025-05-28 08:30:00'),

(6, 1, 'A Local Guide to Seoul Street Food',
"<h1><u>A Local Guide to Seoul Street Food</u></h1>

  <p>Seoul is a paradise for food lovers, and its street food scene is a <b>must-experience</b> for anyone visiting the city. From spicy, crispy, and sweet to savory and chewy, the streets of Seoul are filled with <i>mouthwatering delights</i> that reflect the city’s rich culture and creativity. Here’s a <b>local guide to must-try Seoul street foods</b> that will keep you coming back for more.</p>

  <h2><u>1. Tteokbokki (Spicy Rice Cakes)</u></h2>
  <p>This iconic Korean snack is made of <i>chewy rice cakes</i> in a fiery red chili sauce. Often served with fish cakes and boiled eggs, Tteokbokki is <b>sweet, spicy, and comforting</b>. Find it everywhere from markets to food carts along shopping streets.</p>

  <h2><u>2. Hotteok (Sweet Pancake)</u></h2>
  <p>Perfect on a chilly day, Hotteok is a <b>warm, fried pancake</b> filled with brown sugar, cinnamon, and crushed nuts. The crispy outside and gooey inside make it an <i>irresistible sweet treat</i>.</p>

  <h2><u>3. Gimbap (Korean Seaweed Rice Roll)</u></h2>
  <p>Often called “Korean sushi,” Gimbap is a <b>healthy and portable snack</b> made with rice, vegetables, and sometimes meat or tuna, all rolled in seaweed. It’s affordable, filling, and great for travelers on the go.</p>

  <h2><u>4. Eomuk (Fish Cake Skewers)</u></h2>
  <p>Found bubbling in broth at most street stalls, these <i>warm and savory fish cakes</i> are served on skewers with a side of hot soup. Perfect for quick bites between shopping or sightseeing.</p>

  <h2><u>5. Bungeoppang (Fish-Shaped Pastry)</u></h2>
  <p>This cute, fish-shaped pastry is filled with <b>sweet red bean paste</b> or custard. Crispy on the outside and soft inside, it’s one of Seoul’s most beloved wintertime snacks.</p>

  <h3><u>Where to Go:</u></h3>
  <ul>
    <li><b>Myeongdong</b> – A street food heaven filled with trendy and classic treats.</li>
    <li><b>Gwangjang Market</b> – A traditional food market where you can eat like a local.</li>
    <li><b>Hongdae</b> – Young, creative vibes with lots of unique dessert stalls and snacks.</li>
    <li><b>Noryangjin Fish Market</b> – For fresh seafood prepared right on the spot.</li>
  </ul>

  <h3><u>Tips for First-Timers:</u></h3>
  <ul>
    <li><b>Bring cash</b> – Most stalls only accept Korean won.</li>
    <li><b>Go hungry</b> – There's so much to try, you'll want to sample everything!</li>
    <li><b>Try something new</b> – Don’t be afraid to order what the locals are eating.</li>
  </ul>

  <p>Seoul’s street food isn’t just about eating — it’s about <i>exploring culture through flavor</i>. Whether you’re craving something sweet, spicy, or savory, these vibrant streets will keep your taste buds excited and your stomach full. <b>Come with curiosity and leave with a full heart (and belly)!</b></p>
",
0, '2025-05-16 10:10:00', '2025-05-30 08:30:00'),

(7, 2, 'Hiking Trails Near Auckland You Should not Miss',
" <h1><u>Hiking Trails Near Auckland You Should Not Miss</u></h1>

  <p>Just beyond the urban buzz of Auckland lies a world of <b>lush forests, coastal views, and volcanic landscapes</b>. Whether you're a casual walker or an adventurous hiker, there’s a trail nearby that’s perfect for you. If you love nature and need a quick escape from the city, here are the <b>top hiking trails near Auckland you should not miss</b>.</p>

  <h2><u>1. Hunua Falls Track</u></h2>
  <p>Located about 50 minutes from Auckland CBD, this short loop leads to the stunning <b>Hunua Falls</b>. Surrounded by native bush, it’s a perfect spot for a peaceful picnic or a light walk. <i>Easy, scenic, and great for families</i>.</p>

  <h2><u>2. Rangitoto Island Summit Track</u></h2>
  <p>Take a ferry and hike to the summit of Rangitoto, Auckland’s youngest volcano. The trail is <b>moderate with rugged lava fields</b> and rewarding panoramic views of the Hauraki Gulf at the top. Don’t forget to explore the <i>lava caves</i> on the way back!</p>

  <h2><u>3. Waitākere Ranges – Kitekite Falls Track</u></h2>
  <p>This forest trail in Piha is a must-do. It winds through dense native bush and ends at a beautiful, multi-tiered waterfall. The <b>view from the base of Kitekite Falls</b> is magical, and you can even swim in the pool below. <i>Don’t forget your camera</i>!</p>

  <h2><u>4. Duder Regional Park Coastal Track</u></h2>
  <p>For a more coastal feel, head southeast to Duder Regional Park. The track offers <b>sweeping views of the coastline</b>, open farmland, and native forest. Ideal for sunrise hikes or a quiet weekend escape. <i>Pack snacks and enjoy the open space</i>.</p>

  <h2><u>5. Mount Eden (Maungawhau)</u></h2>
  <p>Right in the heart of Auckland, Mount Eden offers a short hike with a big reward. This extinct volcano features a <b>giant crater and panoramic city views</b>. Great for a quick evening hike or morning stroll. <i>Very accessible by public transport</i>.</p>

  <h3><u>Tips for Hiking Near Auckland:</u></h3>
  <ol>
    <li><b>Check track conditions</b> – Some tracks in the Waitākere Ranges may be closed for kauri dieback protection.</li>
    <li><b>Wear proper shoes</b> – Trails can be muddy or steep in parts.</li>
    <li><b>Bring water and sunscreen</b> – Even short hikes can get hot and dry.</li>
    <li><b>Respect the land</b> – Stay on marked paths and carry out your rubbish.</li>
  </ol>

  <p>Whether you're chasing waterfalls or volcano views, these hikes offer a refreshing way to experience the natural beauty of Tāmaki Makaurau. With so many trails just a short drive or ferry ride away, there’s no excuse not to lace up your boots and <b>explore the outdoors</b>. <i>See you on the trail!</i></p>
",
0, '2025-05-17 08:00:00', '2025-05-18 13:15:00'),

(8, 3, "Hidden Historical Gems in London",
"<p>London is known for its iconic landmarks like Big Ben and Buckingham Palace, but there’s a deeper side to this historic city that many visitors miss. From secret churches to ancient pubs, here are <b>hidden historical gems in London</b> that deserve a spot on your itinerary.</p>

  <h2><u>1. Postman’s Park</u></h2>
  <p>Located near St Paul’s Cathedral, this peaceful park is home to the <i>Memorial to Heroic Self Sacrifice</i> — a wall commemorating ordinary people who died saving others. It’s a <b>quiet, moving tribute</b> that reflects London’s human stories.</p>

  <h2><u>2. The Seven Noses of Soho</u></h2>
  <p>A quirky scavenger hunt awaits! These sculpted noses hidden around Soho are part of an <b>urban art project</b> by Rick Buckley. Locals believe finding all seven brings good luck. <i>It’s a fun way to explore the area’s history and eccentricities</i>.</p>

  <h2><u>3. The Charterhouse</u></h2>
  <p>Dating back to the 14th century, this former monastery and plague pit is now a museum. Take a guided tour to hear about <b>Black Death burials, Tudor royalty, and WW2 bombings</b>. It’s a <i>hidden gem for history buffs</i>.</p>

  <h2><u>4. The Old Operating Theatre Museum</u></h2>
  <p>Tucked into the attic of a church near London Bridge, this is Europe’s oldest surviving surgical theatre. Explore <b>Victorian medical instruments</b> and learn how surgery was performed before anesthesia. <i>Fascinating and a little creepy</i>.</p>

  <h2><u>5. Wilton’s Music Hall</u></h2>
  <p>The oldest surviving music hall in the world, Wilton’s has seen performances since the 1850s. Now restored, it hosts live shows in a delightfully atmospheric space. <b>History meets culture in this East London treasure</b>.</p>

  <h3><u>Local Tips:</u></h3>
  <ul>
    <li><b>Use the Tube smartly</b> – Many hidden spots are walkable from central stations.</li>
    <li><b>Look up</b> – Some architectural surprises are easy to miss at street level.</li>
    <li><b>Join local walking tours</b> – Guides often highlight stories not in the guidebooks.</li>
  </ul>

  <p>Beyond the famous sights, London offers a tapestry of forgotten tales and preserved secrets. Explore these <i>hidden historical corners</i> and discover a different side of the city that most tourists never see. <b>History is everywhere — if you know where to look!</b></p>
",
0, '2025-05-18 17:20:00', '2025-05-25 08:30:00'),

(9, 4, 'Most Beautiful Villages in Southern France',
"<h1><u>Most Beautiful Villages in Southern France</u></h1>

  <p>Southern France is known for its lavender fields, sunshine, and relaxed lifestyle — but its true charm lies in the <b>small, picturesque villages</b> that dot the countryside. These places offer a glimpse of traditional life, stunning views, and <i>authentic French culture</i>. Here are <b>5 must-visit villages in the South of France</b> you shouldn’t miss.</p>

  <h2><u>1. Gordes</u></h2>
  <p>Perched on a hill in the Luberon region, Gordes is a <b>stone-built masterpiece</b>. Wander its winding alleys, visit the 11th-century castle, and enjoy panoramic views of the Provencal landscape. <i>Don’t miss the Tuesday market!</i></p>

  <h2><u>2. Èze</u></h2>
  <p>Located between Nice and Monaco, Èze is a medieval village with <i>cobblestone paths and exotic gardens</i>. Climb to the top for stunning views of the Mediterranean Sea. <b>It's like stepping into a fairytale</b>.</p>

  <h2><u>3. Roussillon</u></h2>
  <p>Famous for its <b>red ochre cliffs and buildings</b>, Roussillon stands out with its vibrant color palette. The village sits atop a hill, surrounded by lavender fields and vineyards. <i>A photographer’s dream</i>.</p>

  <h2><u>4. Saint-Cirq-Lapopie</u></h2>
  <p>Overlooking the Lot River, this <b>cliffside village</b> is often listed among the most beautiful in France. Its historic homes, art galleries, and quiet lanes make it ideal for a peaceful escape. <i>It's like living in a painting</i>.</p>

  <h2><u>5. Collioure</u></h2>
  <p>A seaside gem near the Spanish border, Collioure is known for its <b>brightly colored buildings, Catalan influence, and fresh seafood</b>. The town inspired artists like Matisse and is perfect for both beach lovers and art fans.</p>

  <h3><u>Tips for Exploring Southern French Villages:</u></h3>
  <ul>
    <li><b>Rent a car</b> – Public transport is limited, and driving lets you explore at your own pace.</li>
    <li><b>Travel in shoulder season</b> – Late spring and early autumn offer fewer crowds and better prices.</li>
    <li><b>Learn a few French phrases</b> – Locals appreciate the effort and respond warmly.</li>
  </ul>

  <p>Southern France’s villages are more than just scenic — they’re full of life, history, and warmth. Whether you're sipping wine in a shaded courtyard or walking along a cliffside trail, these destinations offer a true taste of <b>la vie française</b>. <i>Slow down and enjoy the magic of the French countryside</i>.</p>
",
0, '2025-05-19 11:30:00', '2025-06-10 08:30:00'),

(10, 5, 'Top 5 Scenic Road Trips in the USA',
"<p>The United States is made for road tripping. With vast landscapes, iconic highways, and diverse regions, there’s no better way to explore the country than by car. Whether you're into mountains, deserts, or coastal views, here are the <b>top 5 scenic road trips in the USA</b> that every traveler should experience.</p>

  <h2><u>1. Pacific Coast Highway (California)</u></h2>
  <p>Also known as Highway 1, this <b>coastal masterpiece</b> runs from San Francisco to Los Angeles, with dramatic cliffs, ocean views, and charming towns like Big Sur and Carmel-by-the-Sea. <i>Ideal for beach lovers and photographers</i>.</p>

  <h2><u>2. Blue Ridge Parkway (Virginia to North Carolina)</u></h2>
  <p>Known as “America’s Favorite Drive,” this route winds through the Appalachian Highlands, offering <b>breathtaking views of rolling hills, forests, and fall foliage</b>. Perfect for a <i>peaceful, nature-filled journey</i>.</p>

  <h2><u>3. Route 66 (Chicago to Santa Monica)</u></h2>
  <p>This legendary highway is a <b>symbol of American freedom and nostalgia</b>. It passes through eight states and offers a taste of vintage Americana, roadside diners, and quirky attractions. <i>A true bucket-list trip</i>.</p>

  <h2><u>4. Going-to-the-Sun Road (Montana)</u></h2>
  <p>Located in Glacier National Park, this alpine road features <b>snow-capped peaks, glacial lakes, and waterfalls</b>. It’s only open in summer, and every twist and turn is packed with jaw-dropping scenery. <i>Bring your camera and a sense of adventure</i>.</p>

  <h2><u>5. Overseas Highway (Florida Keys)</u></h2>
  <p>This tropical road trip connects Miami to Key West via a series of bridges over turquoise waters. The 7 Mile Bridge is a highlight. Expect <b>palm trees, island vibes, and epic sunsets</b>. <i>Great for a sunny getaway</i>.</p>

  <h3><u>Road Trip Tips:</u></h3>
  <ul>
    <li><b>Plan your stops</b> – Use apps like Roadtrippers to find hidden gems along the way.</li>
    <li><b>Pack essentials</b> – Snacks, water, playlists, and a paper map in case GPS fails.</li>
    <li><b>Check the weather</b> – Conditions can change quickly, especially in mountainous areas.</li>
  </ul>

  <p>America’s roads are full of wonder, surprise, and unforgettable beauty. Whether you're chasing coastlines or mountains, these scenic drives deliver more than just views — they offer freedom, connection, and a taste of true American spirit. <b>Hit the road and let the journey unfold!</b></p>
",
0, '2025-05-20 19:00:00', '2025-05-21 08:00:00'),

(11, 1, 'A Weekend Café Crawl in Paris',
'<p>Measure too maybe off question source. Wrong section town deal movement out stay lot. Parent do ten after those scientist. Medical effort assume teacher wall. Significant his himself clearly very. Expert stop area along individual. Three own bank recognize special good along. Hit another likely character allow pay picture. Record power crime situation.</p><p>Thing particular level place. Practice wide require fast support when. Son true their race special million. Although hot he couple ground. Away and various main too war project occur. Director simply those physical maybe. Information figure box international not type very. As indeed choose west social issue. Air try while reveal bad audience.</p><p>Generation concern store. Standard audience throw debate daughter. Security fall ready usually. Teacher cost both general where. Agreement decade friend which. View when player contain year. Mouth film heavy chair. Source firm drug senior.</p><p>Information animal car after back available. Federal indicate unit opportunity fear great. Know hard we around impact. While top kid he weight before. Someone everybody newspaper read. Up control instead company where future model. Leg PM low data ability recognize.</p><p>Account fear shoulder pick nation choose relationship. Begin marriage which myself if place again. This American either moment ok. Know second government the pull cultural. Along society figure future. Teacher three seven attention team executive care. Phone most improve play idea sing small. Kind nothing case but building. Opportunity cause property government line indeed. Major maybe manage when know central many. Democratic green hospital year suffer without rather bank.</p><p>Guess break about. Their record road dinner seem. Course its respond himself former. Challenge value challenge firm decade cost. Smile home southern hope detail cultural. Only anyone home doctor be. Hair sea quality do. Partner relate mention expect there.</p><p>Learn place might what western upon. Ok majority region democratic entire analysis. Glass face according as. Quite wife however TV law fund. Paper beat five movie. Eight miss couple bag thank generation. Economy rock feeling might his. Gas Republican and various authority leave right.</p><p>Without leave brother bank better she. This degree partner stand next though. Always Congress majority campaign that various. Yes blue tonight particular smile represent. Method left plant evening admit past.</p><p>Run eat expect save. Score middle teacher. His evening wife north. Push region produce develop story. Ask film force health lose.</p><p>Case administration measure happen. Speech theory choice. Member baby share sit. Notice receive degree run staff service government. Car material truth pattern ago other majority final. New clear these speak say. Finish summer else page region start size. Want decade firm section economic television. Employee public figure ground much. Character against physical agency and difficult president at.</p>',
0, '2025-05-25 10:00:00', '2025-06-10 08:30:00'),

(12, 2, 'Churros & Chatter: My Spanish Dessert Journey',
'<p>Form style star east. What to sea. Collection bad until our per leader change. Always future scene heavy personal threat many group. Leader medical class send. Establish manage hotel financial too nearly.</p><p>Now energy rather lay return identify many. Event yet effect. Reflect upon yet seven several might history strong. Decade not forget why under. Purpose mouth then class test check suffer star.</p><p>North weight guy. Fall manager idea issue color small notice kind. Upon we lose water stand single. Could nature interest wear community college probably church. Walk place myself his. Entire expect investment yard responsibility watch. Money fish garden relationship it center accept. Choice produce type none guess we no. Pm sometimes set tonight gun word. Quite piece physical market.</p><p>Through ever war unit back large season. Tell time special beyond could key assume. Play wait education think similar particular. Film manage several dark. Hit simple personal home they although. Great notice north everything state huge TV. Among not girl above.</p><p>Provide likely fire subject. Fire town worker. Image central challenge term memory. By care lose politics. Role mind statement. Hold conference son spend ball company enter son.</p><p>Site military lead travel series. Need although one political almost serious stand. Cover social particularly speech. City four pretty live new myself star. Able simple billion parent now from. Mention would technology budget first age. Affect though cover including. Recognize someone treatment over.</p><p>Truth unit impact key page per. Public none sound include air. Couple hold group but go. Identify real to follow. Second reason live teach movie I situation. Agree middle student bag grow.</p><p>Why child might source where a front. Receive civil single city quite wall various. Watch lot thousand question analysis drive. Forget whom goal clear inside. Theory case north add us accept.</p><p>Yourself affect station member. Another understand of. Sing purpose here ago. Nothing rather represent two hair describe. Authority imagine probably whom it job. High trouble drive loss turn attorney education. Those head against particularly listen. Everybody particularly test hospital personal.</p>',
0, '2025-05-26 10:00:00', '2025-06-10 08:30:00'),
(13, 1, 'A Weekend in New York: Food, Art & Hidden Gems',
'<h1>A Weekend in New York: Food, Art & Hidden Gems</h1>
<p>New York City is a place that never stops moving, but within the hustle lies a treasure trove of quiet corners, incredible meals, and unforgettable moments.</p>

<h2>Morning at Central Park</h2>
<p>There’s no better way to start your day than a walk through <strong>Central Park</strong>. Whether you’re renting a bike or simply strolling through <em>The Mall</em>, it’s a peaceful contrast to the busy avenues that surround it.</p>

<h2>Art and Culture</h2>
<p>The <strong>Metropolitan Museum of Art</strong> is a world in itself. From Egyptian tombs to Van Gogh masterpieces, you could spend hours here. For a modern twist, head downtown to the <em>Whitney Museum of American Art</em>.</p>

<h2>Where to Eat</h2>
<p><strong>Bagels, pizza, and rooftop cocktails</strong> — NYC’s food scene is legendary for a reason. I grabbed breakfast at <em>Russ & Daughters</em>, lunch at <em>Joe’s Pizza</em>, and ended my day with small plates at a rooftop bar in the East Village.</p>

<h2>Hidden Gems</h2>
<ul>
  <li><strong>Paley Park</strong> – a pocket-sized oasis with a waterfall wall on 53rd Street.</li>
  <li><strong>The High Line</strong> – an elevated linear park built on a former rail line.</li>
  <li><strong>Albertine Bookstore</strong> – a stunning French bookstore inside a mansion.</li>
</ul>

<p>New York City rewards curiosity. Don’t just follow the crowds — wander into side streets, try the unknown deli, and speak with the locals. That’s how you really experience the magic.</p>

<p><em>Have you been to NYC? Share your favorite spots in the comments below!</em></p>',
0, '2025-06-08 15:00:00', '2025-06-10 08:30:00'),
(14, 6, 'Brunch Bliss in Brooklyn', "<h1>Brunch Bliss in Brooklyn</h1>
  <p><em>Published: June 13, 2025 · By Plates & Places</em></p>

  <p>There’s a certain kind of magic that settles over Brooklyn on a Sunday morning. The sidewalks are quieter, the sun filters softly through brownstone-lined streets, and the scent of freshly brewed coffee lingers in the air. It’s the perfect time for one of New York City’s most sacred rituals: brunch.</p>

  <h2>Neighborhood Charm, Global Flavors</h2>
  <p>Brooklyn’s brunch scene is a reflection of its rich diversity. Whether you’re strolling through Williamsburg, Park Slope, or DUMBO, you’re bound to stumble upon a cozy café or a buzzing bistro offering everything from Korean-inspired omelets to Latin American arepas.</p>

  <p>At <strong>Café Mogador</strong>, a local favorite in Williamsburg, Moroccan eggs with spicy harissa and warm pita bread are a go-to for both locals and tourists. Just a few blocks away, <strong>Sunday in Brooklyn</strong> serves a legendary hazelnut maple praline pancake that’s almost too pretty to eat—almost.</p>

  <h2>Setting the Scene</h2>
  <p>Part of the appeal of Brooklyn brunch isn’t just the food, but the vibe. Outdoor patios lined with succulents, artfully distressed wooden interiors, hand-written chalkboard menus—there’s a warm, lived-in feel to most brunch spots here. Places like <strong>Butler Bake Shop</strong> in DUMBO offer views of the Manhattan Bridge alongside flaky croissants and flat whites, creating the ultimate slow-Sunday setting.</p>

  <h2>Drinks Worth Waking Up For</h2>
  <p>No brunch is complete without a drink in hand. While bottomless mimosas remain popular, many Brooklyn eateries are getting creative with their morning cocktails. Think turmeric ginger spritzes, lychee bellinis, or cold brew martinis. Coffee lovers, meanwhile, can rejoice in the borough’s obsession with ethically sourced beans and expert pour-overs.</p>

  <h2>Tips for the Best Experience</h2>
  <ul>
    <li><strong>Arrive early:</strong> Some hotspots don’t take reservations, and lines can get long by 10:30 AM.</li>
    <li><strong>Try something new:</strong> Go beyond eggs and bacon—Brooklyn chefs love experimenting.</li>
    <li><strong>Bring a book:</strong> If you're brunching solo, no one will rush you.</li>
    <li><strong>Support small:</strong> Many of the best brunch places are independently owned.</li>
  </ul>

  <p>From flaky pastries to fusion dishes, brunch in Brooklyn is more than a meal—it’s a lifestyle. It’s a chance to slow down, catch up with friends, or simply savor your own company over a plate of something delicious. Whether you’re a foodie, a traveler, or a local in search of a new favorite spot, Brooklyn offers a brunch experience worth getting out of bed for.</p>

  <p><strong>Planning a visit?</strong> Start with Bedford Avenue and let your appetite guide you. You never know where you’ll find your next brunch bliss.</p>
", 0, '2025-06-01 00:00:00', '2025-06-10 00:00:00'),
(15, 6, 'Hidden Cafés of London', "<p>Hidden Cafés of London is an unforgettable experience. Here's what you should try.</p>", 0, '2025-06-02 00:00:00', '2025-06-10 00:00:00'),
(16, 8, 'Sangria & Sunsets in Spain', "<p>Sangria & Sunsets in Spain is an unforgettable experience. Here's what you should try.</p>", 0, '2025-06-03 00:00:00', '2025-06-10 00:00:00'),
(17, 5, 'Fine Dining in Wellington', "<p>Fine Dining in Wellington is an unforgettable experience. Here's what you should try.</p>", 0, '2025-06-04 00:00:00', '2025-06-10 00:00:00'),
(18, 2, 'Dessert Dreams in Madrid', "<p>Dessert Dreams in Madrid is an unforgettable experience. Here's what you should try.</p>", 0, '2025-06-05 00:00:00', '2025-06-10 00:00:00'),
(19, 1, 'Beverage Culture in America', "<p>Beverage Culture in America is an unforgettable experience. Here's what you should try.</p>", 0, '2025-06-06 00:00:00', '2025-06-10 00:00:00'),
(20, 8, 'Café Corners of Christchurch', "<p>Café Corners of Christchurch is an unforgettable experience. Here's what you should try.</p>", 0, '2025-06-07 00:00:00','2025-06-10 00:00:00'),
(21, 1, 'Afternoon Tea in London', "<p>Afternoon Tea in London is an unforgettable experience. Here's what you should try.</p>", 0, '2025-06-08 00:00:00', '2025-06-10 00:00:00'),
(22, 1, 'Espresso in Barcelona', "<p>Espresso in Barcelona is an unforgettable experience. Here's what you should try.</p>", 0, '2025-06-09 00:00:00', '2025-06-10 00:00:00'),
(23, 2, 'NYC Bagel Battle', "<p>NYC Bagel Battle is an unforgettable experience. Here's what you should try.</p>", 0, '2025-06-10 00:00:00', '2025-06-10 00:00:00'),
(24, 6, 'From Tapas to Tiramisu', "<p>From Tapas to Tiramisu is an unforgettable experience. Here's what you should try.</p>", 0, '2025-05-11 00:00:00','2025-06-09 00:00:00'),
(25, 1, 'Michelin Nights in New York', "
  <p>
    When the sun sets over the skyline and the city lights flicker to life, <strong>New York City</strong> becomes a playground for the culinary elite. With more than 70 Michelin-starred restaurants spread across its five boroughs, the Big Apple offers unforgettable dining experiences that fuse innovation, tradition, and artistry.
  </p>

  <p>
    From intimate chef’s counters in Brooklyn to glittering dining rooms in Manhattan, Michelin-starred restaurants redefine what it means to dine well. The experience goes beyond the food—it's a night of luxury, storytelling, and impeccable detail. And yes, it’s every bit as unforgettable as it sounds.
  </p>

  <p><strong>Some must-visit Michelin hotspots:</strong></p>
  <ul>
    <li><strong>Le Bernardin</strong> – A seafood institution with three stars and an ambiance that whispers elegance. Try the <em>tuna carpaccio</em>—delicate, silky, and layered with flavor.</li>
    <li><strong>Eleven Madison Park</strong> – This plant-based fine dining venue has reimagined luxury with an entirely vegan menu. The presentation is just as striking as the flavors.</li>
    <li><strong>Atomix</strong> – An intimate, Korean-inspired tasting menu served at a U-shaped chef’s counter. Each dish is introduced with a beautifully designed card, blending food and story.</li>
  </ul>

  <p>
    A night at a Michelin-starred restaurant isn’t just dinner—it’s a celebration. You’ll often be greeted by name, guided through a symphony of wine pairings, and surprised by amuse-bouches and intermezzo plates that aren’t listed on the menu.
  </p>

  <p><em>Here’s how to make the most of your Michelin night in NYC:</em></p>
  <ol>
    <li><strong>Reserve in advance</strong> – Many top spots book out weeks or months ahead. Set calendar reminders and be ready when reservations open.</li>
    <li><strong>Dress the part</strong> – While some places have relaxed their dress codes, business casual is the minimum. Think chic, understated elegance.</li>
    <li><strong>Trust the chef</strong> – Most Michelin restaurants offer tasting menus. Let go of control and enjoy the journey—each course is part of a larger story.</li>
    <li><strong>Savor slowly</strong> – These experiences are meant to last two or more hours. Enjoy every moment, from the cutlery placement to the dessert finale.</li>
  </ol>

  <p>
    As you leave into the New York night, full from more than just food, you’ll carry the memory of that extraordinary meal—the textures, the wine, the unexpected delight of a perfect pairing. It’s not just about luxury; it’s about artistry, emotion, and storytelling through cuisine.
  </p>

  <p>
    In a city that never sleeps, <strong>Michelin nights</strong> are dreams made real—on a plate, under the soft glow of candlelight.
  </p>", 0,'2025-05-11 00:00:00','2025-06-09 00:00:00'),
(26, 7, "Wellington's Craft Beer Scene", "<p>Wellington's Craft Beer Scene is an unforgettable experience. Here's what you should try.</p>", 0, '2025-05-11 00:00:00','2025-06-09 00:00:00'),
(27, 10, 'Donuts & Downtown L.A.', "<p>Donuts & Downtown L.A. is an unforgettable experience. Here's what you should try.</p>", 0, '2025-05-11 00:00:00', '2025-06-09 00:00:00'),
(28, 1, 'Artisan Coffee in Auckland', "<p>Artisan Coffee in Auckland is an unforgettable experience. Here's what you should try.</p>", 0, '2025-06-15 00:00:00', '2025-06-09 00:00:00'),
(29, 10, 'Parisian Mornings vs London Fog', "<p>Parisian Mornings vs London Fog is an unforgettable experience. Here's what you should try.</p>", 0, '2025-06-01 00:00:00', '2025-06-09 00:00:00'),
(30, 9, 'A Sweet Escape to Spain', "<p>A Sweet Escape to Spain is an unforgettable experience. Here's what you should try.</p>", 0, '2025-06-06 00:00:00', '2025-06-09 00:00:00'),
(31, 4, 'Michelin Moments: Fine Dining Across Spain', " <h1>Michelin Moments: Fine Dining Across Spain</h1>

  <p>
    Spain is world-renowned for its *vibrant street food* and rustic tapas bars, but behind the cobblestone alleys and sun-drenched plazas lies a refined world of **gastronomic artistry**. From Basque Country to Barcelona, fine dining in Spain is not just about food—it’s a journey of innovation, tradition, and unforgettable storytelling.
  </p>

  <p>
    With more than 200 Michelin-starred establishments, Spain continues to push culinary boundaries while honoring its rich cultural roots. Whether it’s a 15-course tasting menu or a single perfect bite, **Spanish haute cuisine** delivers elegance with a bold Mediterranean soul.
  </p>

  <p><strong>What defines fine dining in Spain?</strong></p>
  <ul>
    <li><strong>Local ingredients:</strong> Chefs source fresh seafood, Iberian meats, and regional produce for hyper-seasonal menus.</li>
    <li><strong>Innovative techniques:</strong> Molecular gastronomy, charcoal grilling, and fermentation are all on the table.</li>
    <li><strong>Cultural storytelling:</strong> Each dish often pays tribute to a region, a childhood memory, or even a poem.</li>
  </ul>

  <p>
    *Dining in Spain* at this level is more than a meal—it’s a multi-sensory performance. Many restaurants offer panoramic views, open kitchens, or serve courses with soundscapes and interactive elements. At <em>Disfrutar</em> in Barcelona, edible cocktails and seafood “macarons” defy expectation. Meanwhile, <em>Arzak</em> in San Sebastián showcases Basque heritage with a modern edge.
  </p>

  <p><strong>If you’re ready to indulge, here’s how to plan your Spanish fine dining experience:</strong></p>
  <ol>
    <li><strong>Book ahead:</strong> Reservations for top-tier restaurants fill up months in advance. Some require deposits.</li>
    <li><strong>Research the tasting menu:</strong> Be open-minded—these experiences often include unusual or artistic presentations.</li>
    <li><strong>Dress for the occasion:</strong> Most fine dining restaurants in Spain appreciate smart casual or formal attire.</li>
    <li><strong>Savor slowly:</strong> A typical tasting journey may last 2–4 hours. Each course is designed to surprise and delight.</li>
    <li><strong>Pair with wine:</strong> Spanish wines—Rioja, Albariño, Ribera del Duero—elevate the flavors to another level.</li>
  </ol>

  <p>
    Whether you’re in a Michelin-starred sanctuary in Madrid or a seaside villa in Valencia, **fine dining in Spain** is a celebration of craftsmanship and creativity. Every plate is a canvas, every course a conversation. 
  </p>

  <p>
    So if you’re seeking an evening of elegance and exploration, Spain’s culinary scene is ready to astonish you—one exquisite bite at a time.
  </p>", 0, '2025-06-01 00:00:00', '2025-06-09 00:00:00'),
(32, 6, 'Cupcakes & Castles in the UK', "<p>Cupcakes & Castles in the UK is an unforgettable experience. Here's what you should try.</p>", 0, '2025-06-06 00:00:00', '2025-06-09 00:00:00'),
(33, 9, 'Wine & Wonders of Napa', " <p>
    Nestled in the sun-kissed valleys of Northern California, Napa is more than a wine region—it's a *symphony of senses*, where every vineyard whispers a story and every sip holds a legacy. Known worldwide for its world-class Cabernet Sauvignon and picturesque landscapes, **Napa Valley** is a haven for wine lovers and seekers of refined experiences.
  </p>

  <p>
    From family-run estates to architectural marvels, the valley offers a stunning range of experiences for every kind of traveler. Whether you're a sommelier-in-training or a weekend wanderer, Napa’s charm is undeniable. But it’s not just the wine that makes this region magical—it’s the harmony between nature, innovation, and hospitality that turns every visit into an unforgettable retreat.
  </p>

  <p><strong>Here’s what makes Napa truly special:</strong></p>
  <ul>
    <li><strong>Legendary wineries:</strong> From <em>Opus One</em> to <em>Stag's Leap</em>, the names here are synonymous with quality and history.</li>
    <li><strong>Scenic beauty:</strong> Rolling vineyards, golden hills, and dramatic sunsets create a perfect backdrop for exploration.</li>
    <li><strong>Art & architecture:</strong> Many estates feature galleries, sculpture gardens, and design-forward tasting rooms.</li>
    <li><strong>Farm-to-table dining:</strong> Michelin-starred restaurants and artisanal markets make Napa a foodie's paradise.</li>
  </ul>

  <p>
    The best way to explore Napa is to plan your day around *wine flights and leisurely lunches*. Start early with a tour at a sustainable vineyard, followed by a chef-curated picnic overlooking the vines. Take your time—it’s not about rushing from one tasting to another, but soaking in the rhythm of the valley.
  </p>

  <p><strong>Planning your perfect Napa day?</strong></p>
  <ol>
    <li><strong>Book tastings in advance:</strong> Many wineries now require reservations, especially on weekends.</li>
    <li><strong>Hire a driver or take a tour:</strong> Safety and relaxation go hand in hand—let someone else navigate the winding roads.</li>
    <li><strong>Explore boutique wineries:</strong> Some of Napa’s best-kept secrets are found off the beaten path.</li>
    <li><strong>Pack layers:</strong> Mornings can be cool, afternoons warm, and evenings breezy—even in summer.</li>
    <li><strong>Don’t skip the sparkling:</strong> Napa’s méthode champenoise rivals some of France’s finest.</li>
  </ol>

  <p>
    With each vineyard visit, you’re not just tasting wine—you’re experiencing *a story rooted in soil, sun, and centuries of craftsmanship*. Whether you’re sipping by a fireplace or under an oak tree, **Napa’s wine country invites you to slow down, savor, and celebrate**.
  </p>", 0, '2025-06-01 00:00:00', '2025-06-09 00:00:00'),
  (34, 1,"French Flavours: A Culinary Stroll through France","
  <p>
    Few countries stir the senses like France. From charming bistros in Montmartre to seaside cafés in Marseille, 
    the culinary traditions of France are not just meals—they're a *way of life*. Whether you're sipping wine 
    under the Eiffel Tower or indulging in buttery pastries in a provincial village, every bite in France 
    tells a story.
  </p>

  <p>
    **The French understand food not just as sustenance, but as a celebration.** Every region has a signature dish, 
    and each meal is an opportunity to slow down and savor. Here's a quick look at some of the must-try delicacies 
    across the country:
  </p>

  <ul>
    <li><strong>Ratatouille</strong> – A Provençal vegetable stew that's as colorful as it is flavorful.</li>
    <li><strong>Bouillabaisse</strong> – A rich seafood soup from the southern coast, best enjoyed with a side of rouille and crusty bread.</li>
    <li><strong>Quiche Lorraine</strong> – A savory pie filled with eggs, cream, and bacon originating from northeastern France.</li>
  </ul>

  <p>
    No visit to France is complete without indulging your sweet tooth. From *pain au chocolat* to delicate *macarons*, 
    French desserts are both elegant and unforgettable.
  </p>

  <ol>
    <li><em>Tarte Tatin</em> – An upside-down caramelized apple tart, often served warm with cream.</li>
    <li><em>Crème Brûlée</em> – Creamy custard topped with a crisp caramel shell, perfect for cracking with a spoon.</li>
    <li><em>Éclair</em> – A choux pastry filled with cream and glazed with chocolate—both light and indulgent.</li>
  </ol>

  <p>
    Perhaps the most iconic part of French food culture is its café life. Sitting at a terrace with a coffee or a glass 
    of wine while watching the world go by is a Parisian ritual. Here, meals stretch over hours, *conversation flows*, 
    and time feels irrelevant.
  </p>

  <p>
    **In France, food isn't fast. It's thoughtful, layered, and rich with history.** Whether you're backpacking on a budget 
    or indulging in a Michelin-starred evening, the flavors of France will stay with you long after your plate is cleared.
  </p>

  <p>
    So next time you're in France, skip the tourist traps. Wander off the main streets, follow the smell of butter and herbs, 
    and find that quiet little corner café. It’s there you’ll discover the true heart of French cuisine.
  </p>",0, '2025-06-09 00:00:00', '2025-06-10 00:00:00');




INSERT INTO tags (tag_name)
VALUES
('Cafe'), ('Dessert'), ('Spicy'), ('Thailand'), ('New Zealand'), ('Budget Travel'), ('Japan'), ('Foodie'),
('France'), ('Spain'), ('London'), ('America'), ('Fine Dining'), ('Food'),('Travel');

INSERT INTO article_tags (article_id, tag_id)
VALUES
(1, 1),  -- Cafe
(1, 7),  -- Japan
(1, 2),
(2, 2),  -- Dessert
(3, 5),  -- New Zealand
(4, 3),  -- Spicy
(4, 4),  -- Thailand
(5, 6),  -- Budget Travel
(5, 7),  -- Japan
(6, 14), -- Food
(6, 15), -- Travel
(8, 15),
(8, 11),
(9, 9),
(9, 15),
(10, 12),
(10, 15),
(11, 9), -- France
(11, 1),  -- Cafe
(11, 2),
(12, 10), -- Spain
(12, 2), -- Dessert
(13, 3),
(13, 12), --America
(14, 12),
(15, 11), --London
(16, 10),
(17, 15),
(18, 3),
(21, 11),
(21, 1),
(22, 1),
(23, 6),
(25, 15),
(25, 12),
(26, 6),
(27, 3),
(27, 12),
(28, 1),
(28, 5),
(28, 2),
(28, 13),
(30, 10),
(31, 1),
(31, 10),
(31, 13),
(31, 14),
(32, 1),
(32, 13),
(33, 13),
(34, 9);


INSERT INTO article_images (article_id, image_id, image_url)
VALUES
(1, 1,'/uploads/kyoto-cafes.jpg'),
(3, 1,'/uploads/u24.jpg'),
(2, 1,'/uploads/milford-sound.jpg'),
(4, 1,'/uploads/bangkok-spicy.jpg'),
(5, 1,'/uploads/japan-budget.jpg'),
(6, 1,'/uploads/u1.jpg'),
(7, 1,'/uploads/u2.jpg'),
(8, 1,'/uploads/u3.jpg'),
(9, 1,'/uploads/u4.jpg'),
(10, 1,'/uploads/u5.jpg'),
(11, 1,'/uploads/u6.jpg'),
(12, 1,'/uploads/u7.jpg'),
(13, 1,'/uploads/u8.jpg'),
(14, 1,'/uploads/u9.jpg'),
(15, 1,'/uploads/u10.jpg'),
(16, 1,'/uploads/u11.jpg'),
(17, 1,'/uploads/u12.jpg'),
(18, 1,'/uploads/u13.jpg'),
(19, 1,'/uploads/u14.jpg'),
(20, 1,'/uploads/u15.jpg'),
(21, 1,'/uploads/u16.jpg'),
(22, 1,'/uploads/u17.jpg'),
(23, 1,'/uploads/u18.jpg'),
(24, 1,'/uploads/u19.jpg'),
(25, 1,'/uploads/u20.jpg'),
(26, 1,'/uploads/u21.jpg'),
(27, 1,'/uploads/u22.jpg'),
(28, 1,'/uploads/u23.jpg'),
(29, 1,'/uploads/u20.jpg'),
(30, 1,'/uploads/u21.jpg'),
(31, 1,'/uploads/u25.jpg'),
(32, 1,'/uploads/u2.jpg'),
(33, 1,'/uploads/u3.jpg'),
(34, 1,'/uploads/u26.jpg');




INSERT INTO comments (comment_id, article_id, parent_id, user_id, content, created_dttm, updated_dttm, is_deleted) VALUES
(1, 1, NULL, 2, 'This article is incredibly insightful! @annie88', '2025-06-01 10:00:00', '2025-06-01 10:00:00', 0),
(2, 1, 1, 1, 'Totally agree with you. @admin123', '2025-06-01 10:15:00', '2025-06-01 10:15:00', 0),
(3, 2, NULL, 4, '@sherryx I think the author missed an important point.', '2025-06-01 11:00:00', '2025-06-01 11:30:00', 0),
(4, 3, 3, 3, '@yangdev What point do you mean?', '2025-05-01 11:45:00', '2025-06-01 11:00:00', 0),
(5, 4, NULL, 5, 'This was helpful for my research. Thanks!', '2025-05-02 09:00:00', '2025-06-01 11:00:00', 0),
(6, 5, 1, 1, 'lovely place to go.', '2025-05-01 12:00:00', '2025-06-01 11:00:00', 1),
(7, 11, NULL, 7, 'General professional career two.', '2025-05-25 11:00:00', '2025-06-01 11:00:00', 0),
(8, 11, NULL, 11, 'great', '2025-05-25 12:00:00','2025-06-01 11:00:00', 0),
(9,13, NULL, 1, 'loved to go' , '2025-04-08 02:00:55', '2025-06-01 11:00:00', 0),
(10, 2, NULL, 6, 'Loved the dessert picks — can’t wait to try them!', '2025-06-02 09:00:00', '2025-06-02 09:00:00', 0),
(11, 2, 10, 3, 'Pidapipo is my favorite spot too!', '2025-06-02 09:30:00', '2025-06-02 09:30:00', 0),
(12, 4, NULL, 8, 'I tried Pad Kra Pao last week — absolutely delicious!', '2025-06-02 11:00:00', '2025-06-02 11:00:00', 0),
(13, 4, 12, 9, 'Agreed! So simple but so flavorful.', '2025-06-02 12:00:00', '2025-06-02 12:00:00', 0),
(14, 5, NULL, 10, 'Very practical guide, thanks!', '2025-06-03 08:15:00', '2025-06-03 08:15:00', 0),
(15, 5, NULL, 4, 'Convenience store food in Japan is actually amazing.', '2025-06-03 09:00:00', '2025-06-03 09:00:00', 0),
(16, 6, NULL, 2, 'Hotteok was my favorite street food in Seoul!', '2025-06-03 11:00:00', '2025-06-03 11:00:00', 0),
(17, 6, 16, 12, 'Same! So comforting on cold nights.', '2025-06-03 11:20:00', '2025-06-03 11:20:00', 0),
(18, 7, NULL, 13, 'Rangitoto was surprisingly easy to hike. Great views too.', '2025-06-04 10:00:00', '2025-06-04 10:00:00', 0),
(19, 8, NULL, 5, 'This park is so underrated. Nice inclusion!', '2025-06-04 11:30:00', '2025-06-04 11:30:00', 0),
(20, 9, NULL, 14, 'Èze was magical. Feels like a movie set!', '2025-06-05 09:00:00', '2025-06-05 09:00:00', 0),
(21, 9, 20, 15, 'And the view from the garden is insane!', '2025-06-05 09:30:00', '2025-06-05 09:30:00', 0),
(22, 10, NULL, 16, 'Route 66 is definitely on my travel bucket list.', '2025-06-06 10:00:00', '2025-06-06 10:00:00', 0),
(23, 10, 22, 6, 'Just did it last year — it’s worth it!', '2025-06-06 11:00:00', '2025-06-06 11:00:00', 0),
(24, 12, NULL, 17, 'Spain’s dessert game is strong 💪', '2025-06-06 12:00:00', '2025-06-06 12:00:00', 0),
(25, 12, 24, 1, 'Agreed! Can’t forget churros con chocolate.', '2025-06-06 12:20:00', '2025-06-06 12:20:00', 0),
(26, 13, NULL, 18, 'A weekend isn’t enough for NYC 😅', '2025-06-07 09:00:00', '2025-06-07 09:00:00', 0),
(27, 13, 26, 7, 'True. Still haven’t done half the museums.', '2025-06-07 09:15:00', '2025-06-07 09:15:00', 0),
(28, 15, NULL, 11, 'Love the cozy cafes in Shoreditch!', '2025-06-07 10:30:00', '2025-06-07 10:30:00', 0),
(29, 17, NULL, 20, 'Fine dining in Wellington is so underrated.', '2025-06-08 08:00:00', '2025-06-08 08:00:00', 0),
(30, 17, 29, 3, 'Check out Logan Brown if you haven’t yet!', '2025-06-08 08:30:00', '2025-06-08 08:30:00', 0),
(31, 18, NULL, 1, 'This dessert place in Madrid sounds divine.', '2025-06-08 09:00:00', '2025-06-08 09:00:00', 0),
(32, 19, NULL, 9, 'Never thought beverage culture could be so interesting.', '2025-06-08 09:30:00', '2025-06-08 09:30:00', 0),
(33, 22, NULL, 6, 'Espresso in Barcelona is strong and smooth. Loved it!', '2025-06-09 08:00:00', '2025-06-09 08:00:00', 0),
(34, 25, NULL, 8, 'Michelin nights = unforgettable experiences.', '2025-06-09 10:00:00', '2025-06-09 10:00:00', 0),
(35, 25, 34, 10, 'Especially in NYC’s dining scene.', '2025-06-09 10:15:00', '2025-06-09 10:15:00', 0),
(36, 28, NULL, 11, 'Artisan coffee culture in Auckland is booming!', '2025-06-10 09:00:00', '2025-06-10 09:00:00', 0),
(37, 30, NULL, 12, 'Spain is dessert heaven 🍰', '2025-06-10 10:00:00', '2025-06-10 10:00:00', 0),
(38, 30, 37, 13, 'Can’t stop thinking about crema catalana!', '2025-06-10 10:30:00', '2025-06-10 10:30:00', 0),
(39, 31, NULL, 14, 'Bourbon tasting in Kentucky was a surprising highlight.', '2025-06-10 11:00:00', '2025-06-10 11:00:00', 0),
(40, 1, 2, 1, 'Especially in NYC’s dining scene.', '2025-06-09 10:15:00', '2025-06-09 10:15:00', 0),
(41, 2, 3, 1, 'Artisan coffee culture in Auckland is booming!', '2025-06-10 09:00:00', '2025-06-10 09:00:00', 0),
(42, 3, 1, 2, 'Spain is dessert heaven 🍰', '2025-06-10 10:00:00', '2025-06-10 10:00:00', 0),
(43, 4, NULL, 2, 'Can’t stop thinking about crema catalana!', '2025-06-10 10:30:00', '2025-06-10 10:30:00', 0),
(44, 5, NULL, 2, 'Bourbon tasting in Kentucky was a surprising highlight.', '2025-06-10 11:00:00', '2025-06-10 11:00:00', 0),
(45, 1, NULL, 2, 'A surprising highlight.', '2025-06-10 11:00:00', '2025-06-10 11:00:00', 0);






INSERT INTO comment_mentions (comment_id, mentioned_id)
VALUES
(1, 1),
(2, 2),
(3, 3),
(4, 4);

INSERT INTO article_likes (user_id, article_id)
VALUES
(1, 1),
(1, 2),
(1, 3),
(1, 11),
(1, 12),
(1, 13),
(1, 14),
(2, 1),
(2, 2),
(2, 3),
(2, 12),
(2,13),
(3, 1),
(3, 3),
(3, 8),
(3, 9),
(3,13),
(5, 3),
(5,13),
(4, 5),
(4,13),
(6, 1),
(6, 2),
(6, 3),
(6, 4),
(6, 5),
(6, 6),
(6, 7),
(6, 8),
(6, 9),
(6, 10),
(6, 11),
(6, 12),
(6, 13),
(6, 14),
(6, 15),
(6, 16),
(6, 17),
(6, 18),
(6, 19),
(6, 20),
(6, 21),
(6, 22),
(6, 23),
(6, 24),
(6, 25),
(6, 26),
(6, 27),
(6, 28),
(6, 29),
(6, 30),
(6, 31),
(6, 32),
(6, 33),
(8, 11), 
(7, 11),
(9, 12), 
(10, 12),
(10, 11), 
(11, 1),
(11, 2),
(11, 3),
(11, 4),
(11, 5),
(11, 6),
(11, 7),
(11, 8),
(11, 9),
(11, 10),
(11, 11),
(11, 12),
(11, 13),
(11, 14),
(11, 15),
(11, 16),
(11, 17),
(11, 18),
(11, 19),
(11, 20),
(11, 21),
(11, 22),
(11, 23),
(11, 24),
(11, 25),
(11, 26),
(11, 27),
(11, 28),
(11, 29),
(11, 30),
(13, 1),
(13, 2),
(13, 3),
(13, 4),
(13, 5),
(13, 6),
(13, 7),
(13, 8),
(13, 9),
(13, 10),
(13, 11),
(13, 12),
(13, 13),
(13, 14),
(13, 15),
(13, 16),
(13, 17),
(13, 18),
(13, 19),
(13, 20),
(13, 21),
(13, 22),
(13, 23),
(13, 24),
(13, 25),
(13, 26),
(13, 27),
(13, 28);



INSERT INTO subscriptions (subscriber_id, target_user_id)
VALUES
(1, 3),  -- Annie follows Yang's 
(1, 2),
(1, 6),
(2, 1),  -- Sherry follows Annie's 
(3, 1),
(3, 2),  -- Yang follows Sherry's food blog
(3, 4),
(4, 5),  -- Steven follows Lip’s 
(5, 4),  -- Lip follows Steven's 
(6, 1),
(7, 1),
(8, 1),
(9, 1);

INSERT INTO notifications 
(notification_id, sender_id, receiver_id, type, article_id, comment_id, is_read)
VALUES
(1, 1, 2, 'new_article', 1, NULL, 0),
(2, 3, 4, 'tag_comment', 3, 3, 0),
(3, 5, 3, 'new_article', 5, NULL, 0),
(4, 4, 1, 'tag_comment', 4, 4, 0),
(5, 2, 5, 'tag_comment', 2, 1, 0);


INSERT INTO Avatar (avatar_url) VALUES
('/image/avatar01.jpg'),
('/image/avatar02.jpg'),
('/image/avatar03.jpg'),
('/image/avatar04.jpg'),
('/image/avatar05.jpg'),
('/image/avatar06.jpg'),
('/image/avatar07.jpg'),
('/image/avatar08.png'),
('/image/avatar09.png'),
('/image/avatar10.png'),
('/image/avatar11.png'),
('/image/avatar12.png'),
('/image/avatar13.png'),
('/image/avatar14.png'),
('/image/avatar15.png');
