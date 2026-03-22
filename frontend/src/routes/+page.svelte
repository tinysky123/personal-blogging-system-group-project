

<script>
  import { PUBLIC_IMAGES_URL } from "$env/static/public";
  import { substringHTML } from '$lib/util.js';
  import { goto } from '$app/navigation';


  export let data;


let places = [
  { image: "/HP_america.png", title: "#America", tag: "America" },
  { image: "/HP_spain.png", title: "#Spain", tag: "Spain"},
  { image: "/HP_London.png", title: "#England", tag: "London" },
  { image: "/HP_Paris.png", title: "#France", tag: "France" },
  { image: "/HP_nz.png", title: "#New Zealand", tag: "New Zealand" }
];

let mostLiked = data.mostLiked;
let latest = data.latest;

let scrollPlacesContainer;
let scrollLikedContainer;


let scrollContainer;

function scrollLeft() {
  scrollPlacesContainer.scrollBy({ left: -400, behavior: 'smooth' });
}

function scrollRight() {
  scrollPlacesContainer.scrollBy({ left: 400, behavior: 'smooth' });
}

function scrollLikedLeft() {
  scrollLikedContainer.scrollBy({ left: -400, behavior: 'smooth' });
}

function scrollLikedRight() {
  scrollLikedContainer.scrollBy({ left: 400, behavior: 'smooth' });
}

function goToArticle(id) {
    goto(`/articles/${id}`);
  }

</script>

<svelte:head>
  <title >Plates & Places</title>
</svelte:head>


<section class="banner">
  <div class="banner-overlay">
    <p style="margin:0.2rem; paddind:1rem" class="banner-subtext">Crafted with passion by Group 8. Follow our journey across cultures and cuisines.</p>
 </div>
</section>


<div class="wrap">
<!-- Featured Places -->
<section class="featured-places-glass-row">
  <div class="featured-left">
    <h2>|FEATURED PLACES</h2>
    <p class="section-subtext">Wander through iconic destinations and hidden gems across the globe.</p>
    <div class="explore-more-container">
      <a href="/articles" class="explore-more-btn">
        <span>Explore More Places</span>
        <img src="/icon-right-arrow.png" alt="Right arrow" class="arrow-icon" />
      </a>
    </div>
  </div>

  <div class="featured-right">
    <button class="scroll-btn left" on:click={scrollLeft}>&larr;</button>

    <div class="place-scroll-container" bind:this={scrollPlacesContainer}>
      {#each places as place}
        <a href={`/tags/${encodeURIComponent(place.tag)}`} class="place-card-link">
          <div class="place-card">
            <img src={place.image} alt={place.title} />
            <div class="place-title">{place.title}</div>
            <div class="place-subtext">Discover food & stories</div>
          </div>
        </a>
      {/each}
    </div>

    <button class="scroll-btn right" on:click={scrollRight}>&rarr;</button>
  </div>
</section>



<!-- Taste the World Section -->
<section class="food-categories-2col">
  <div class="food-left">
    <div class="food-circle-grid">
      <a href="/tags/Dessert" class="food-circle">
        <img src="/food_dessert.jpg" alt="Dessert" />
        <span>#Dessert</span>
      </a>
      <a href="/tags/Cafe" class="food-circle">
        <img src="/food_cafe.jpg" alt="Cafe" />
        <span>#Café</span>
      </a>
      <a href="/tags/Fine%20Dining" class="food-circle">
        <img src="/food_dining.jpg" alt="Fine Dining" />
        <span>#Fine Dining</span>
      </a>
      
    </div>
  </div>

  <div class="food-right">
    <h2>|TASTE THE WORLD</h2>
    <p class="section-subtext">
      Satisfy your cravings—discover desserts, cafés, and fine dining experiences from around the world.
    </p>
    <div class="explore-more-container-right">
      <a href="/tags" class="explore-more-btn">
        <img src="/icon-left-arrow.png" alt="Left arrow" class="arrow-icon" />
        <span>Explore More Articles</span>

      </a>
    </div>
  </div>
</section>

</div>

  
<section class="article-section">
  <h2>|MOST LIKED ARTICLES</h2>
<p class="section-subtext">Your fellow explorers' favorites—most-loved stories from our global contributors.</p>
  <div class="carousel-wrapper">
    <button class="carousel-btn left" on:click={scrollLikedLeft}>&larr;</button>
    <div class="most-liked-scroll" bind:this={scrollLikedContainer}>
      {#each mostLiked as article}
        <div class="most-liked-card">
        <div class="grid-container">
            <div class="card" on:click={() => goToArticle(article.article_id)}>
              <div class="cover-wrapper">
                    <img 
                      src={article.image_url ? "http://localhost:3000" + article.image_url : '/placeholder.jpg'} 
                      alt="Cover Photo" 
                      class="cover-photo" 
                    />
             </div>

              <div class="card-content">
                  <div class="author-info">
                      <img src={"http://localhost:3000" + article.avatar_url} alt="Avatar" class="avatar-large" />
                      <div>
                        <p class="author">{article.username}</p>
                        <p class="date">{article.created_dttm}</p>
                      </div>
                  </div>

                   <h3>{substringHTML(article.title).slice(0, 50)}...</h3>
                   <p class="preview">{substringHTML(article.content).slice(0, 100)}...</p>

                    <div class="meta">
                      <span>💬 {article.comment_cnt}</span>
                      <span>❤️ {article.like_cnt}</span>
                    </div>
              </div>
            </div>
        </div>
        </div>
      {/each}
      <button class="carousel-btn right" on:click={scrollLikedRight}>&rarr;</button>
  </div>
</section>
<!-- Footer -->
<footer class="site-footer">
    <p>&copy; 2025 Plates & Places | Created by Group 8</p>
</footer>





<style>
h2{
  font-size: 3rem;
}


.place-card {
  position: relative;
  width: 200px;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  background-color: white;
}

.place-card:hover {
  transform: scale(1.07);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
}


.place-card img {
  width: 100%;
  height: 260px;
  object-fit: cover;
}


.place-title {
  position: absolute;
  top: 10px;
  left: 10px;
  background: rgba(0,0,0,0.5);
  color: white;
  padding: 0.3rem 0.6rem;
  border-radius: 8px;
  font-weight: bold;
  font-size: 1.5rem;
}

.place-subtext {
  position: absolute;
  bottom: 10px;
  left: 10px;
  background: rgba(255,255,255,0.8);
  color: #333;
  padding: 0.2rem 0.5rem;
  border-radius: 6px;
  font-size: 1.2rem;
  font-weight: 500;
}



.carousel-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  margin: 2rem 0;
}

.carousel-btn {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  font-size: 1.5rem;
  width: 40px;
  height: 40px;
  cursor: pointer;
  z-index: 2;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.carousel-btn:hover {
  transform: translateY(-50%) scale(1.1);
  background: rgba(255, 255, 255, 0.35);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
}


.carousel-btn.left {
  left: 0;
}
.carousel-btn.right {
  right: 0;
}


.most-liked-scroll {
  display: flex;
  overflow-x: auto;
  gap: 1rem;
  scroll-behavior: smooth;
  padding: 1rem 3rem;
  scrollbar-width: none;
  
}

.site-footer {
  background: #2c3e50;
  padding: 0.2rem;
  font-family: var(--heading-1-font-family);
  text-align: center;
  color: #ccc;
}


.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  padding: 2rem;
  background-color: rgb(255,255,255,0.2);
}

.card {
  background-color: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.05);
  transition: transform 0.25s ease, box-shadow 0.25s ease;
  cursor: pointer;
  display: flex;
  flex-direction: column;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.cover-wrapper {
  width: 100%;
  height: 180px;
  overflow: hidden;
}

.cover-photo {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card-content {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.avatar-large {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
}

.card h3 {
  font-size: 1.4rem;
  margin: 0;
  font-weight: 600;
  color: #333;
}

.author, .date {
  font-size: 1rem;
  color: #666;
  margin: 0;
}

.preview {
  font-size: 0.95rem;
  color: #444;
  line-height: 1.4;
}

.meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  color: #999;
}


.food-circle-grid {
  display: flex;
  justify-content: center;
  gap: 2rem;
  flex-wrap: wrap;
  margin-top: 2rem;
}


.food-circle {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-decoration: none;
  color: #333;
  transition: transform 0.3s ease;
  position: relative;
  z-index: 1;
}

.food-circle:hover {
  transform: translateY(-5px);
}

.food-circle img {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  object-fit: cover;
  box-shadow: 0 4px 10px rgba(0,0,0,0.2);
  transition: transform 0.3s ease;
  z-index: 0;
}
.food-circle span {
  margin-top: 0.5rem;
  font-weight: bold;
  font-size: 1.6rem;
  color: #333;
  text-align: center;
  background-color: white;
  z-index: 2;
  position: relative;
  padding: 0.3rem 0.6rem;
  border-radius: 10px;
}


.wrap{
  background-color: rgba(255, 255, 255, 0.5);
  border-radius: 20px;
  padding-bottom: 2%;
  width: 95%;
  margin: auto;
}

.banner-subtext {
  font-size: 1.2rem;
  color: #f0f0f0;
  margin-top: 0.3rem;
}


.section-subtext {
  font-size: 1.5rem;
  color: #666;
  margin-bottom: 1.5rem;
  font-weight: 400;
}

.explore-more-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #4D96FF, #6BCB77); 
  color: white;
  padding: 0.75rem 2rem;
  font-size: 1.1rem;
  font-weight: 600;
  border-radius: 30px;
  text-decoration: none;
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}



.arrow-icon {
  width: 20px;
  height: 20px;
  transition: transform 0.3s ease;
}


.explore-more-container {
  display: flex;
  justify-content: center;
  margin-top: 2rem;
}

.explore-more-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, rgb(170, 170, 170), rgba(164, 232, 224, 1));
  color: white;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 30px;
  text-decoration: none;
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}


.explore-more-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}


.explore-more-btn:hover .arrow-icon {
  transform: translateX(4px);
}


.explore-more-container-right {
  display: flex;
  justify-content: flex-end;
  width: 100%;
  margin-top: 1rem;
}


.featured-left {
  flex: 1 1 30%;
  padding-left: 1rem;
  max-width: 400px;
}

.featured-left h2 {
  font-size: 2.5rem;
  font-weight: 700;
}

.featured-right {
  flex: 1 1 65%;
  display: flex;
  justify-content: center;
}



.food-categories-2col {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 3rem 2rem;
  /* background-color: rgba(255, 255, 255, 0.85); */
  border-radius: 20px;
  flex-wrap: wrap;
  gap: 2rem;
}

.food-left {
  flex: 1 1 60%;
  display: flex;
  justify-content: center;
}

.food-right {
  flex: 1 1 35%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding-left: 1rem;
  max-width: 400px;
}

.food-right h2 {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
}
.article-section{
background-color: rgb(0,0,0,0.6);
}
.article-section >h2 {
  margin: 1rem auto;
  padding: 1rem;
  text-align: center;
  font-size: 2.5rem;
  font-weight: 700;
  color: white;
}
.article-section >p {
  text-align: center;
  font-weight: 400;
  color: white;
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  text-align: center;
}

@media (max-width: 768px) {
  .food-categories-2col {
    flex-direction: column;
    align-items: center;
  }


  .featured-left, .food-right {
    text-align: center;
    padding: 0;
  }

  .featured-left h2,
  .food-right h2 {
    font-size: 2rem;
  }
}



.place-scroll-container {
  display: flex;
  gap: 1.5rem;
  overflow-x: auto;
  scroll-behavior: smooth;
  padding: 1rem 2rem;
  scrollbar-width: none;
}

.place-scroll-container::-webkit-scrollbar {
  display: none;
}


.place-card {
  min-width: 200px;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  background: rgba(255, 255, 255, 0.3);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  flex-shrink: 0;
  position: relative;
}


.place-card img {
  width: 100%;
  height: 260px;
  object-fit: cover;
}




.place-subtext {
  position: absolute;
  bottom: 10px;
  left: 10px;
  background: rgba(255,255,255,0.8);
  color: #333;
  padding: 0.2rem 0.5rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 500;
}


.scroll-btn {
  background: rgba(0,0,0,0.3);
  color: white;
  border: none;
  border-radius: 50%;
  font-size: 1.5rem;
  width: 40px;
  height: 40px;
  cursor: pointer;
  z-index: 2;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
}

.scroll-btn.left {
  left: 10px;
}

.scroll-btn.right {
  right: 10px;
}


.featured-places-glass-row {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: stretch; /* ensures equal height */
  padding: 3rem 2rem;
  border-radius: 30px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(31, 38, 135, 0.1);
  overflow: hidden;
  gap: 2rem;
  flex-wrap: nowrap;
  width: 100%;      
  box-sizing: border-box;
}
.featured-left {
  flex: 0 0 35%;
  max-width: 35%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start; 
  text-align: left;       
  gap: 1rem;
}


.featured-right {
  flex: 1;
  min-width: 0; 
  position: relative;
}



.featured-left h2 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

.place-scroll-container {
  display: flex;
  gap: 1.5rem;
  overflow-x: auto;
  scroll-behavior: smooth;
  padding: 1rem 2rem;
  scrollbar-width: none;
}

.place-scroll-container::-webkit-scrollbar {
  display: none;
}

.place-card {
  min-width: 200px;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  background: rgba(255, 255, 255, 0.3);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  flex-shrink: 0;
  position: relative;
}



/* Scroll arrows */
.scroll-btn {
  background: rgba(0,0,0,0.3);
  color: white;
  border: none;
  border-radius: 50%;
  font-size: 1.5rem;
  width: 40px;
  height: 40px;
  cursor: pointer;
  z-index: 2;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
}

.scroll-btn.left {
  left: 10px;
}

.scroll-btn.right {
  right: 10px;
}


@media (max-width: 768px) {
  .featured-places-glass-row {
    flex-direction: column;
    align-items: center;
  }

  .featured-left {
    text-align: center;
    align-items: center;
  }
}




</style>