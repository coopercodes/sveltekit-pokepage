<!-- localhost:5173/coopercodes1@gmail.com -->
<script lang="ts">
    import { page } from "$app/stores";
    import { getPokemon, getPokemonList } from "$lib/pokemonAPI";
    export let data;

    let { supabase, session } = data
    $: ({ supabase, session } = data)
    $: email = $page.params.email;

    let pokemonList: any = []
    let pokemonData: any = [] // [ {pikachu}, {bulbasaur}, {charizard}]
    let profile: any = {
        description: "This is your description, feel free to write about yourself or your favorite Pokemon.",
        pokemon_ids: [1, 2, 3]
    }
    let isModalOpen = false;
    let searchInput = "";

    // profiles in Supabase which has columns for a description, pokemon_ids, email
    // from this page, we can use the supabase object to then save to our database (grab data)

    async function refreshPokemonData() {
        pokemonData = [];

        profile.pokemon_ids.map(async (id: number) => {
            // 1
            const data = await getPokemon(id.toString());

            if(pokemonData === undefined) {
                pokemonData = [data]; 
            } else {
                //  [ { }, { } , { data } ]
                pokemonData = [ ...pokemonData, data ]
            }
        })
    }

    async function saveProfile() {
        const { data: profileData, error: profileError } = await supabase.from("profiles").select("*").eq('email', email)

        if(profileData?.length === 0) { // create a new row
            const { data, error } = await supabase
                .from("profiles")
                .insert({ ...profile,  user_id: session?.user?.id , email: session?.user?.email })
        } else { // update the profile row
            const { data, error } = await supabase
                .from("profiles")
                .update(profile) // description, pokemon_id
                .eq("user_id", session?.user?.id)
        }
    }

    page.subscribe(async () => {
        pokemonList = await getPokemonList(); // []
        

        // Try to grab the current profile (coopercodes3@gmail.com)
        const { data: profileData, error: profileError } = await supabase.from("profiles").select("description, pokemon_ids").eq('email', email)
        // if the profileData is undefined AND the current user is coopercodes3@gmail.com
        // MAKE A NEW PROFILE
        console.log(email);
        console.log(session?.user?.email);
        console.log(profileData)
        if(profileData?.length == 0 && email == session?.user?.email) {
            // saveProfile
            console.log("SAVE PROFILE");
            await saveProfile();
        } else if (profileData != null && profileData.length > 0) {
            profile = profileData[0]
        } else {
            console.log("NO PROFILE")
            profile = {
                description: "This user does not have a profile yet!",
                pokemon_ids: []
            }
        }

        // if profileData exist and it has data inside of it
        // show coopercodes3@gmail.com data to user

        // If no data exists, say NO PROFILE
        await refreshPokemonData();
    });

    async function savePageEdits() {
        await saveProfile();
        await refreshPokemonData();
        isModalOpen = false;
    }

    async function togglePokemon(id: number) {
        let pokemonIDs = profile.pokemon_ids;
        // [1, 2, 3] "toggle 2" -> [1, 3] -. "toggle 2" -> [1, 2, 3]

        // make sure we never have more than 3 pokemon
        if(pokemonIDs.length >= 3  && !pokemonIDs.includes(id)) {
            alert("You can only have 3 pokemon maximum!")
            return
        }
        // if pokemonIDs has ID, remove it
        if(pokemonIDs.includes(id)) {
            let index = pokemonIDs.indexOf(id);
            pokemonIDs.splice(index, 1);
        } else {
            pokemonIDs.push(id);
        }
        
        profile.pokemon_ids = [...pokemonIDs]
    }

</script>

<div class="hero min-h-screen bg-base-300">
    <div class="hero-content">
        <div class="max-w-2xl text-center">
            <h1 class="text-white font-bold text-4xl">{email}'s Page</h1>
            <p class="py-3 max-w-md mx-auto">{profile.description}</p>
            <div class="grid grid-cols-3">
                {#if pokemonData === undefined}
                    <p>Loading...</p>
                {:else}
                    {#each pokemonData as pokemon}
                        <div class="card bg-slate-700 m-4 shadow-lg shadow-blue-900">
                            <div class="card-body">
                                <div class="text-center">
                                    <img src={pokemon.sprites.front_default} alt="Pokemon" class="w-32 h-32 mx-auto" />
                                    <h2 class="text-white text-2xl font-bold">{pokemon.name}</h2>
                                    <p class="text-info">{pokemon.types[0].type.name}</p>
                                </div>
                            </div>
                        </div>
                    {/each}
                {/if}
            </div>
            {#if email == session?.user?.email}
                <button class="btn btn-info" on:click={() => isModalOpen = true}>Edit Page</button>
                <dialog class="modal min-w-lg" class:modal-open={isModalOpen}>
                    <div class="modal-box">
                        <h3>Edit Your PokePage</h3>
                        <p>Here you can make edits to your page, such as description or pokemon selected.</p>
                        <p class="text-white p-2">Edit your description</p>
                        <textarea 
                            bind:value={profile.description} 
                            class="textarea textarea-bordered textarea-lg w-full max-w-md h-[300px]"
                        />
                        <p class="text-white p-2">Select your pokemon</p>
                        <div class="grid grid-cols-3 overflow-y-scroll max-h-[600px] m-3">
                            <div class="col-span-3">
                                <input 
                                    type="text" 
                                    class="input input-bordered w-full"
                                    placeholder="Search for a pokemon!"
                                    bind:value={searchInput}
                                />
                            </div>
                            {#each pokemonList as pokemon, index} <!-- pokemon are 1 indexed -->
                                <!-- "char" -> "charmander", "charizard" -->
                                {#if pokemon.name.includes(searchInput)}
                                    <button 
                                        class={
                                            "card bg-slate-700 h-12 p-1 m-1 justify-center items-center "
                                            + (profile.pokemon_ids.includes(index + 1) 
                                            ? "border-2 border-blue-600"
                                            : "")
                                        }
                                        on:click={() => togglePokemon(index + 1)}
                                    >
                                        <div class="text=center">
                                            <h2 class="text-white text-xl">{pokemon.name}</h2>
                                        </div>
                                    </button>
                                {/if}
                            {/each}
                        </div>
                        <button class="btn btn-success" on:click={() => savePageEdits()}>Save Edits</button>
                    </div>
                </dialog>
            {/if}
        </div>
    </div>
</div>