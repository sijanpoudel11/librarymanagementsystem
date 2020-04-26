var router = require("express").Router();
var adminschema = require("../models/adminschema");
var bookSchema = require("../models/bookschema");
var membersSchema = require("../models//userschema");
var recordSchema = require("../models/recordschema");
var auth = require("../passport/auth");
var bcrypt = require('bcryptjs');
var passport = require("passport");
var mongoose = require("mongoose");

router.get("/", auth.redirectdashboard, (req, res) => {
  res.render("home",{messege: req.flash("loginerror")});
});



// ROUTE TO ADMIN CREATE PAGE
router.get("/createnewadmin", (req, res) => {
  res.render("createnewadmin");
});
//CREATE AND SAVE NEW ADMIN TO DATABASE
router.post("/createnewadmin", (req, res) => {
  //   let {username,password} = req.body;
  var username = req.body.username.toLowerCase();
  var password = req.body.password;
  var hashpassword = bcrypt.hashSync(password, 10);

  //CREATE NEW ADMIN
  var newadmin = new adminschema({
    username: username,
    password: hashpassword,
  })
    //SAVE ADMIN IN DATABASE

    .save()
    .then((admin) => {
      res.send(admin);
    })
    .catch((err) => {
      res.send(err);
    });
});

router.post(
  "/login",
  passport.authenticate("login", {
    successRedirect: "/dashboard",
    failureRedirect: "/",
    failureFlash: true,
  })
);

router.get("/dashboard", auth.entureauthenticated, (req, res) => {
  res.render("dashboard");
});

router.get("/managebooksandusers", (req, res) => {
  res.render("managebooksandusers");
});

router.get("/addnewbook", (req, res) => {
  res.render("addNewBook");
});

router.post("/addNewBook", (req, res) => {
  var { tittle, author, publishedYear, numberOfBooks } = req.body;
  // CREATE AND INSERT NEW BOOK IN DATABASE

  var newbook = new bookSchema({
    _id: mongoose.Types.ObjectId(),
    tittle,
    author,
    publishedYear,
    numberOfBooks,
    available: numberOfBooks,
  })
    .save()
    .then((newbook) => {
      res.send(newbook);
    })
    .catch((err) => {
      res.send(err);
    });
});

router.get("/addNewMember", (req, res) => {
  res.render("addNewMember");
});

router.post("/addNewMember", (req, res) => {
  var { name, address, contacts, evaluation } = req.body;
  var joinedYear = new Date().getFullYear();

  var newMember = new membersSchema({
    _id: mongoose.Types.ObjectId(),
    name,
    address,
    contacts,
    joinedYear,
    evaluation,
  })
    .save()
    .then((member) => {
      res.send(member);
    })
    .catch((err) => {
      res.send(err);
    });
});


router.get("/manageExistingMembers", (req, res) => {
membersSchema.find({})
.exec()
.then(users=>{
  res.render('allUsers',{messege : req.flash("updateSuccess"), users:users});
})
.catch(err=>{
  res.send(err);
})
});

router.get("/issueNewBorrow", (req, res) => {
  bookSchema.find({ available: { $gte: 1 } }, function (err, books) {
    if (err) {
      res.send(err);
    }

    membersSchema.find({}, function (err, members) {
      if (err) {
        res.send(err);
      }

      res.render("createNewRecord", { books: books, members: members });
    });
  });
});

router.post("/issueNewBorrow", (req, res) => {
  var { selectBook, selectMember, submissionDeadline } = req.body;

  console.log(req.body);
  var borrowDate = new Date();

  var newRecord = new recordSchema({
    _id: mongoose.Types.ObjectId(),
    bookid: selectBook,
    userid: selectMember,
    borrowDate: borrowDate,
    submissionDeadline: submissionDeadline,
  })
    .save()
    .then((record) => {
      // DECREMENT THE AVAILABLE NUMBER
      bookSchema.findById(selectBook, (err, doc) => {
        doc.available = doc.available - 1;
        doc.save((err, doc) => {
          if (err) {
            console.log(err);
          }
          console.log(doc);
        });
      });

      res.redirect("/showAllRecords");
    })
    .catch((err) => {
      res.send(err);
    });
});

router.get("/returnBorrowedBook", (req, res) => {
  bookSchema
    .find()
    .then((books) => {
      membersSchema
        .find()
        .then((members) => {
          res.render("selectrecord", {
            messege: req.flash("selectionerror"),
            books: books,
            members: members,
          });
        })
        .catch((err) => {
          res.send(err);
        });
    })
    .catch((err) => {
      res.send(err);
    });
});

router.post("/selectRecord", (req, res) => {
  var bookid = req.body.bookId;
  var memberid = req.body.memberId;

  recordSchema
    .find({ bookid: bookid, userid: memberid })
    .populate("bookid")
    .populate("userid")
    .exec()
    .then((record) => {
      console.log(record.length);
      if (record.length > 0) {
        res.render("showAllRecords", { records: record });
      } else {
        req.flash("selectionerror", "please choose correct options");
        res.redirect("/returnBorrowedBook");
      }
    })
    .catch((err) => {
      res.send(err);
    });
});

router.get("/showAllRecords", (req, res) => {
  recordSchema
    .find({})
    .where({ completed: false })
    .populate("bookid")
    .populate("userid")
    .sort({ submissionDeadline: 1 })
    .exec()
    .then((records) => {
      res.render("showAllRecords", { records: records });
    })
    .catch((err) => {
      res.send(err);
    });
});

router.get("/updateRecord/:id", (req, res) => {
  var id = req.params.id;

  recordSchema
    .findById(id)
    .populate("bookid")
    .populate("userid")
    .exec()
    .then((record) => {
      var date = new Date();
      var limit = date > record.submissionDeadline;
      res.render("detailedRecord", { record: record, limit: limit });
    });
});

router.get("/completedReturn/:id", (req, res) => {
  var id = req.params.id;
  recordSchema
    .findById(id)
    .exec()
    .then((record) => {
      console.log(record);
      record.completed = true;
      var bookkid = record.bookid;
      bookSchema
        .findById(bookkid)
        .exec()
        .then((book) => {
          book.available += 1;
          book
            .save()
            .then(console.log(book))
            .catch((err) => res.send(err));
        })
        .catch((err) => res.send(err));
      record
        .save()
        .then(() => {
          console.log("record completed");
          res.redirect("/showAllRecords");
        })
        .catch((err) => {
          console.log(err);
        });
    })
    .catch((err) => {
      console.log(err);
      res.redirect("/showAllRecords");
    });
});

router.get("/extendDeadline/:id", (req, res) => {
  var id = req.params.id;
  recordSchema
    .findById(id)
    .exec()
    .then((record) => {
      record.deadlineExtended = true;
      record
        .save()
        .then((doc) => {
          console.log(doc);
          res.redirect("/showAllRecords");
        })
        .catch((err) => {
          res.send(err);
        });
    })
    .catch((err) => {
      res.send(err);
    });
});

router.get("/booksStatus", (req, res) => {
  bookSchema
    .find()
    .then((books) => {
      res.render("booksStatus", {
        messege: req.flash("bookUpdated"),
        books: books,
      });
    })
    .catch((err) => {
      res.send(err);
    });
});

router.get("/booksStatus/update/:id", (req, res) => {
  var bookid = req.params.id;
  bookSchema
    .findById(bookid)
    .exec()
    .then((book) => {
      res.render("booksStatusDetails", { books: book });
    })
    .catch((err) => {
      res.send(err);
    });
});

router.post("/bookStatus/updateBooks/:id", (req, res) => {
  var bookid = req.params.id;

  bookSchema
    .findByIdAndUpdate(
      bookid,
      {
        $set: {
          tittle: req.body.tittle,
          author: req.body.author,
          numberOfBooks: req.body.totalBooks,
          available: req.body.available,
        },
      },
      { new: true }
    )
    .then((doc) => {
      console.log(doc);
      req.flash("bookUpdated", "Book Details Updated Succesfully");
      res.redirect(301, "/booksStatus");
    })
    .catch((err) => {
      res.send(err);
    });
});

router.get("/updateUser/:id",(req,res)=>{
  var userid = req.params.id;

  membersSchema.findById(userid)
  .exec()
  .then(user=>{
    res.render('updateUserDetails',{user : user});
  })
  .catch(err=>{
    res.send(err);

  })
});

router.post("/updateUser/:id",(req,res)=>{
  var id = req.params.id;
  membersSchema.findByIdAndUpdate(id,
    {$set:{
    name : req.body.name,
    address : req.body.address,
    contacts : req.body.contacts,
    joinerYear : req.body.joinedYear,
    evaluation : req.body.evaluation
  },
},{new:true}
)
.then(user=>{
  console.log(user);
  req.flash("updateSuccess","UserDetails Succesfully Updated");
  res.redirect(301,"/manageExistingMembers");
})
.catch(err=>{
  res.send(err);
})


})



module.exports = router;
