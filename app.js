const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");




const app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
const curDay = getDayOfWeek();



mongoose.connect("mongodb+srv://admin_Zaen:Rebelt5i@cluster0-lnlwz.mongodb.net/todolistDB", {useNewUrlParser: true});

const mItemsSchema = mongoose.Schema({
    name: String
});

const itemMode = mongoose.model("mItem", mItemsSchema );


const defIt1 = new itemMode({
    name: "Welcome to your to do list"
});
const defIt2 = new itemMode({
    name: "<--- Hit this to delete an item"
});
const defIt3 = new itemMode({
    name: "Hit the + button to add an item"
});

const defaultItems = [defIt1, defIt2, defIt3];









const mListSchema = mongoose.Schema({
    name: String,
    items: [mItemsSchema]
});



const listMode = mongoose.model("mList", mListSchema)


app.get("/" , (req, res) =>{
    
    itemMode.find({},  (err, fndItms) =>{
        if ( err )
        {
            console.log(err);
        }
        res.render("list", {kindOfDay: curDay, todoitems: fndItms});
        
    });
    
    
})

app.listen( process.env.PORT ||3000, () =>{
    console.log("Server Listening on port 3000");
    
})






app.post("/" , (req, res) =>{
    const item= req.body.newListItem;
    const listName = req.body.list;

    

    const tmpNewItem = new itemMode({
        name: item
    });

    if ( listName === curDay )
    {
        tmpNewItem.save();
        res.redirect("/");
    }
    else
    {
        listMode.findOne({name: listName}, (err, fndList) =>{
            fndList.items.push(tmpNewItem);
            fndList.save();
            res.redirect("/" + listName);
        });
    }


    
    
    
    
})


app.get("/:customListPath", (req, res) =>{
    const custListName = _.capitalize(req.params.customListPath);
    
    
    


    listMode.findOne({name: custListName}, (err, results) =>{
        if  ( !err )
        {
            if ( !results )
            {
                const nList = new listMode(
                    {
                        name: custListName,
                        items: defaultItems
                    }
                )
                nList.save();
                res.redirect("/" + custListName);
            }
            else
            {
               res.render("list", {kindOfDay: results.name, todoitems:results.items});
                
            }
        }
    })
    
    
    
});

app.post("/delete", (req, res) =>{
    const check_id = req.body.checkBox;
    const tmpName = req.body.listName;

    console.log(tmpName + " tst");

    if ( tmpName === curDay )
    {
        itemMode.deleteOne({_id: check_id }, (err) =>{
            if ( err )
            {
                console.log(err);
            }
            else
            {
                console.log("Successfully removed itemS");
                
            }
            res.redirect("/");
        })
    }
    else 
    {
        listMode.findOneAndRemove({name: tmpName}, {$pull: {items:{_id: check_id}}}, (err, results) =>{

            if ( !err)
            {
                res.redirect("/" + tmpName)
            }
        });
    }
    

    
    

})






function getDayOfWeek(){

    const day = new Date();

    const options = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"

    }

    
    let output = day.toLocaleDateString("en-us", options);
   


    
    return output;

}